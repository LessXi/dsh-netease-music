// 极简 QR 码编码器（Byte 模式，纠错等级 L/M，版本 1–12）。
// 只依赖 node 内置能力，用于把扫码登录 URL 画成 SVG，避免把 codekey 交给第三方服务。
// 参考 ISO/IEC 18004 标准表格与 Reed-Solomon 纠错流程。

const ECB = ['L', 'M', 'Q', 'H'];

// 每版本、每纠错等级的数据码字数
const DATA_CODEWORDS = [
  null,
  [19, 16, 13, 9],
  [34, 28, 22, 16],
  [55, 44, 34, 26],
  [80, 64, 48, 36],
  [108, 86, 62, 46],
  [136, 108, 76, 60],
  [156, 124, 88, 66],
  [194, 154, 110, 86],
  [232, 182, 132, 100],
  [274, 216, 154, 122],
  [324, 254, 180, 140],
  [370, 290, 206, 158],
];

// 每版本、每纠错等级、每块的纠错码字数
const EC_CODEWORDS_PER_BLOCK = [
  null,
  [7, 10, 13, 17],
  [10, 16, 22, 28],
  [15, 26, 18, 22],
  [20, 18, 26, 16],
  [26, 24, 18, 22],
  [18, 16, 24, 28],
  [20, 18, 18, 26],
  [24, 22, 22, 26],
  [30, 22, 20, 24],
  [18, 26, 24, 28],
  [20, 30, 28, 24],
  [24, 22, 26, 28],
];

const NUM_BLOCKS = [
  null,
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 2, 2],
  [1, 2, 2, 4],
  [1, 2, 4, 4],
  [2, 4, 4, 4],
  [2, 4, 6, 5],
  [2, 4, 6, 6],
  [2, 5, 8, 8],
  [4, 5, 8, 8],
  [4, 5, 8, 11],
  [4, 8, 10, 11],
];

const ALIGNMENT_POSITIONS = [
  null,
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
];

// 格式信息里的纠错等级编码（L=01, M=00, Q=11, H=10）
const EC_FORMAT_BITS = { L: 1, M: 0, Q: 3, H: 2 };

// ---------- GF(256) 与 Reed-Solomon ----------

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) GF_EXP[i] = GF_EXP[i - 255];
}

const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]]);

const generatorCache = new Map();
function generatorPoly(degree) {
  const cached = generatorCache.get(degree);
  if (cached) return cached;
  let poly = [1];
  for (let i = 0; i < degree; i += 1) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= gfMul(poly[j], 1);
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  generatorCache.set(degree, poly);
  return poly;
}

function rsRemainder(data, degree) {
  const gen = generatorPoly(degree);
  const result = new Array(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ result[0];
    result.shift();
    result.push(0);
    for (let i = 0; i < degree; i += 1) result[i] ^= gfMul(gen[i + 1], factor);
  }
  return result;
}

// ---------- 数据编码 ----------

class BitBuffer {
  constructor() {
    this.bits = [];
  }
  put(value, length) {
    for (let i = length - 1; i >= 0; i -= 1) this.bits.push((value >>> i) & 1);
  }
  get length() {
    return this.bits.length;
  }
}

function encodeData(text, version, ecLevel) {
  const capacityBits = DATA_CODEWORDS[version][ECB.indexOf(ecLevel)] * 8;
  const bytes = [];
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code < 0x10000) bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    else
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
  }
  const buffer = new BitBuffer();
  buffer.put(0b0100, 4); // Byte 模式
  buffer.put(bytes.length, version <= 9 ? 8 : 16);
  for (const byte of bytes) buffer.put(byte, 8);
  const terminator = Math.min(4, capacityBits - buffer.length);
  buffer.put(0, terminator);
  while (buffer.length % 8 !== 0) buffer.bits.push(0);
  const dataCodewords = DATA_CODEWORDS[version][ECB.indexOf(ecLevel)];
  const capacityCodewords = capacityBits / 8;
  const bytesOut = [];
  for (let i = 0; i < buffer.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | buffer.bits[i + j];
    bytesOut.push(byte);
  }
  for (let pad = 0xec; bytesOut.length < capacityCodewords; pad ^= 0xec ^ 0x11) bytesOut.push(pad);
  if (bytesOut.length !== dataCodewords + 0 && dataCodewords !== capacityCodewords) {
    // 版本 1-12 的数据码字总量即容量（无额外填充需求），这里保持显式检查
  }
  return bytesOut;
}

function addEccAndInterleave(data, version, ecLevel) {
  const numBlocks = NUM_BLOCKS[version][ECB.indexOf(ecLevel)];
  const ecPerBlock = EC_CODEWORDS_PER_BLOCK[version][ECB.indexOf(ecLevel)];
  const totalCodewords = DATA_CODEWORDS[version][ECB.indexOf(ecLevel)];
  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);
  const blocks = [];
  let offset = 0;
  for (let i = 0; i < numBlocks; i += 1) {
    const dataLen = shortBlockLen - ecPerBlock + (i < numShortBlocks ? 0 : 1);
    const blockData = data.slice(offset, offset + dataLen);
    offset += dataLen;
    const ecc = rsRemainder(blockData, ecPerBlock);
    const block = blockData.slice();
    if (i >= numShortBlocks) block.push(0); // 占位，交织时跳过
    blocks.push({ data: block, ecc, extra: i >= numShortBlocks });
  }
  const result = [];
  const maxDataLen = shortBlockLen - ecPerBlock + 1;
  for (let i = 0; i < maxDataLen; i += 1) {
    for (const block of blocks) {
      if (i < block.data.length && !(block.extra && i === block.data.length - 1)) result.push(block.data[i]);
    }
  }
  for (let i = 0; i < ecPerBlock; i += 1) {
    for (const block of blocks) result.push(block.ecc[i]);
  }
  return result;
}

function getNumRawDataModules(version) {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (version >= 7) result -= 36;
  }
  return result;
}

// ---------- 矩阵构造 ----------

function makeMatrix(version) {
  const size = version * 4 + 17;
  const modules = Array.from({ length: size }, () => new Array(size).fill(null));
  const isFunction = Array.from({ length: size }, () => new Array(size).fill(false));

  const setFunction = (x, y, dark) => {
    modules[y][x] = dark;
    isFunction[y][x] = true;
  };

  // 定位图案 + 分隔符
  const drawFinder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || x >= size || y < 0 || y >= size) continue;
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        setFunction(x, y, dist !== 2 && dist !== 4);
      }
    }
  };
  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);

  // 定时图案
  for (let i = 8; i < size - 8; i += 1) {
    setFunction(i, 6, i % 2 === 0);
    setFunction(6, i, i % 2 === 0);
  }

  // 对齐图案
  const positions = ALIGNMENT_POSITIONS[version];
  for (const ax of positions) {
    for (const ay of positions) {
      if ((ax === 6 && ay === 6) || (ax === 6 && ay === size - 7) || (ax === size - 7 && ay === 6)) continue;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          setFunction(ax + dx, ay + dy, dist !== 1);
        }
      }
    }
  }

  // 预留格式信息区域（占位，稍后写真实值）
  for (let i = 0; i < 9; i += 1) {
    if (!isFunction[8][i]) setFunction(i, 8, false);
    if (!isFunction[i][8]) setFunction(8, i, false);
  }
  for (let i = 0; i < 8; i += 1) {
    if (!isFunction[8][size - 1 - i]) setFunction(size - 1 - i, 8, false);
    if (!isFunction[size - 1 - i][8]) setFunction(8, size - 1 - i, false);
  }
  setFunction(8, size - 8, true); // 固定深色模块

  // 版本信息（v7+）
  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (version << 12) | rem;
    for (let i = 0; i < 18; i += 1) {
      const bit = ((bits >>> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunction(a, b, bit);
      setFunction(b, a, bit);
    }
  }

  return { modules, isFunction, size };
}

function drawFormatBits(matrix, ecLevel, mask) {
  const { modules, size } = matrix;
  const data = (EC_FORMAT_BITS[ecLevel] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  const bit = (i) => ((bits >>> i) & 1) === 1;
  // 第一条副本（围绕左上定位图案）：列 8 竖排 + 行 8 横排
  for (let i = 0; i <= 5; i += 1) modules[i][8] = bit(i);
  modules[7][8] = bit(6);
  modules[8][8] = bit(7);
  modules[8][7] = bit(8);
  for (let i = 9; i <= 14; i += 1) modules[8][14 - i] = bit(i);
  // 第二条副本（右上横排 + 左下竖排）
  for (let i = 0; i <= 7; i += 1) modules[8][size - 1 - i] = bit(i);
  for (let i = 8; i <= 14; i += 1) modules[size - 15 + i][8] = bit(i);
  modules[size - 8][8] = true;
}

function placeData(matrix, codewords) {
  const { modules, isFunction, size } = matrix;
  const bits = [];
  for (const byte of codewords) for (let i = 7; i >= 0; i -= 1) bits.push((byte >>> i) & 1);
  let index = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert += 1) {
      for (let j = 0; j < 2; j += 1) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (isFunction[y][x]) continue;
        modules[y][x] = index < bits.length ? bits[index] === 1 : false;
        index += 1;
      }
    }
  }
}

const MASKS = [
  (x, y) => (x + y) % 2 === 0,
  (x, y) => y % 2 === 0,
  (x, y) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

function applyMask(matrix, mask) {
  const { modules, isFunction, size } = matrix;
  const fn = MASKS[mask];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!isFunction[y][x] && fn(x, y)) modules[y][x] = !modules[y][x];
    }
  }
}

function penalty(matrix) {
  const { modules, size } = matrix;
  let score = 0;
  // 规则 1：连续同色
  for (let y = 0; y < size; y += 1) {
    let run = 1;
    for (let x = 1; x < size; x += 1) {
      if (modules[y][x] === modules[y][x - 1]) run += 1;
      else {
        if (run >= 5) score += run - 2;
        run = 1;
      }
    }
    if (run >= 5) score += run - 2;
  }
  for (let x = 0; x < size; x += 1) {
    let run = 1;
    for (let y = 1; y < size; y += 1) {
      if (modules[y][x] === modules[y - 1][x]) run += 1;
      else {
        if (run >= 5) score += run - 2;
        run = 1;
      }
    }
    if (run >= 5) score += run - 2;
  }
  // 规则 2：2x2 同色块
  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const v = modules[y][x];
      if (v === modules[y][x + 1] && v === modules[y + 1][x] && v === modules[y + 1][x + 1]) score += 3;
    }
  }
  // 规则 3：类似定位图案的 1011101 片段
  const patternA = [true, false, true, true, true, false, true, false, false, false, false];
  const patternB = [false, false, false, false, true, false, true, true, true, false, true];
  const matches = (line, start, pattern) => {
    for (let i = 0; i < pattern.length; i += 1) if (line[start + i] !== pattern[i]) return false;
    return true;
  };
  for (let y = 0; y < size; y += 1) {
    const line = modules[y];
    for (let x = 0; x <= size - 11; x += 1) {
      if (matches(line, x, patternA) || matches(line, x, patternB)) score += 40;
    }
  }
  for (let x = 0; x < size; x += 1) {
    const line = modules.map((row) => row[x]);
    for (let y = 0; y <= size - 11; y += 1) {
      if (matches(line, y, patternA) || matches(line, y, patternB)) score += 40;
    }
  }
  // 规则 4：深色比例偏离 50%
  let dark = 0;
  for (const row of modules) for (const v of row) if (v) dark += 1;
  const total = size * size;
  const percent = (dark * 100) / total;
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;
  return score;
}

/**
 * 生成二维码矩阵。
 * @param {string} text 内容（按 UTF-8 编码进 Byte 模式）
 * @param {{ecLevel?: 'L'|'M', version?: number, mask?: number}} options 可选强制版本/掩码（调试用）
 * @returns {{version:number, ecLevel:string, mask:number, size:number, modules:boolean[][]}}
 */
export function encodeQr(text, options = {}) {
  const ecLevel = options.ecLevel ?? 'M';
  let version = options.version ?? 0;
  const maxVersion = options.maxVersion ?? 12;
  const byteLength = utf8Length(text);
  if (version === 0) {
    for (let v = 1; v <= maxVersion; v += 1) {
      const capacityBits = DATA_CODEWORDS[v][ECB.indexOf(ecLevel)] * 8;
      const headerBits = 4 + (v <= 9 ? 8 : 16);
      if (headerBits + byteLength * 8 <= capacityBits) {
        version = v;
        break;
      }
    }
    if (version === 0) throw new Error(`QR: 内容过长（${byteLength} 字节），请缩短`);
  }
  const data = encodeData(text, version, ecLevel);
  const codewords = addEccAndInterleave(data, version, ecLevel);
  const matrix = makeMatrix(version);
  placeData(matrix, codewords);

  const candidates = options.mask === undefined ? [0, 1, 2, 3, 4, 5, 6, 7] : [options.mask];
  let best = null;
  for (const mask of candidates) {
    const trial = {
      modules: matrix.modules.map((row) => row.slice()),
      isFunction: matrix.isFunction,
      size: matrix.size,
    };
    applyMask(trial, mask);
    drawFormatBits(trial, ecLevel, mask);
    const score = penalty(trial);
    if (best === null || score < best.score) best = { score, mask, modules: trial.modules };
  }
  return { version, ecLevel, mask: best.mask, size: matrix.size, modules: best.modules };
}

function utf8Length(text) {
  let n = 0;
  for (const char of text) {
    const code = char.codePointAt(0);
    n += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }
  return n;
}

/**
 * 把矩阵渲染成 SVG 字符串（每个模块 1 单位，白底黑块，含 quiet zone）。
 * @param {boolean[][]} modules
 * @param {{margin?: number, dark?: string, light?: string}} options
 */
export function toSvg(modules, options = {}) {
  const margin = options.margin ?? 2;
  const dark = options.dark ?? '#000000';
  const light = options.light ?? '#ffffff';
  const size = modules.length;
  const total = size + margin * 2;
  let path = '';
  for (let y = 0; y < size; y += 1) {
    let x = 0;
    while (x < size) {
      if (!modules[y][x]) {
        x += 1;
        continue;
      }
      let run = 1;
      while (x + run < size && modules[y][x + run]) run += 1;
      path += `M${x + margin} ${y + margin}h${run}v1h-${run}z`;
      x += run;
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}" shape-rendering="crispEdges">` +
    `<rect width="${total}" height="${total}" fill="${light}"/>` +
    (path ? `<path d="${path}" fill="${dark}"/>` : '') +
    `</svg>`
  );
}

/** 便捷入口：文本 → SVG 字符串 */
export function qrSvg(text, options = {}) {
  return toSvg(encodeQr(text, options).modules, options);
}
