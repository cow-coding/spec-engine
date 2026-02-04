# Spec-Engine

> **AI-Powered PRD Generator from Business Logic**

Transform your `.spec` business logic files into comprehensive Product Requirements Documents (PRD) using **local AI** — **zero cost, privacy-first, and lightning fast**.

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/cow-coding/spec-engine)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.85.0+-blue.svg)](https://code.visualstudio.com/)

---

## 🎯 Overview

**Spec-Engine** is a VS Code extension that automatically generates detailed Product Requirements Documents (PRD) from your business logic code. Simply write your `.spec` file, click a button, and get a professional PRD in seconds.

### Key Benefits

- **💰 Zero Cost**: Uses local AI (Ollama) — no API fees, no usage limits
- **🔒 Privacy-First**: Your code never leaves your machine
- **⚡ Real-time**: Instant logic calculation + live progress tracking
- **📊 High-Quality**: Optimized prompts generate detailed, structured PRDs
- **🌐 Cross-Platform**: Works on macOS, Windows, and Linux

---

## ✨ Features

### 🚀 Core Features

- **Real-time Logic Calculation**: `.spec` files are evaluated instantly as you type
- **AI-Powered PRD Generation**: Transforms logic into comprehensive documentation
- **Auto-Sleep System**: Ollama server starts on-demand and auto-shuts down after 5 minutes of inactivity
- **Cancel Anytime**: Abort generation mid-process with one click
- **Markdown Export**: Save PRDs as `.md` files

### 🎨 UI/UX

- **Live Progress Bar**: Visual feedback with real-time percentage (0% → 100%)
- **Step-by-Step Messages**: 4-stage loading indicator
  - 🔍 Analyzing code...
  - 🧠 AI thinking...
  - ✍️ Generating document...
  - ✨ Finalizing...
- **GitHub Markdown Styling**: Beautiful, professional rendering
- **Smooth Animations**: No flickering, 5% progress increments

### 🛠️ Developer Experience

- **Auto-Installation**: Detects and installs Ollama automatically
- **One-Click Model Download**: Gemma 2B (~1.6GB) with terminal integration
- **Cross-Platform Support**: Mac, Windows, Linux
- **VS Code Theme Compatible**: Adapts to dark/light mode

---

## 🎬 Demo

> _Screenshots and GIFs coming soon!_

### Workflow Preview

1. Create a `.spec` file
2. Write your business logic
3. Click **"✨ AI 기획서 생성"**
4. Watch live progress (0% → 95% → 100%)
5. Save the generated PRD

---

## 📖 .spec Language Reference

### Basic Syntax

#### Variable Assignment
```spec
variableName = value
price = 10000
discount = 0.2
```

#### Data Types
- **Numbers**: `100`, `3.14`, `-50`
- **Booleans**: `true`, `false`
- **Arrays**: `[1, 2, 3, 4, 5]`

#### Comments
```spec
// This is a comment
// Comments are ignored by the engine
```

#### Operators
```spec
// Arithmetic
total = price + tax
netPrice = price - discount
finalPrice = price * (1 - discountRate)
average = sum / count

// Comparison (in conditions)
isExpensive = price > 100000
isAffordable = price <= 50000
isEqual = price == targetPrice
```

### Built-in Functions

#### Aggregation Functions

| Function | Description | Example | Result |
|----------|-------------|---------|--------|
| `sum()` | Sum of array elements | `sum([1, 2, 3])` | `6` |
| `avg()` | Average of array | `avg([10, 20, 30])` | `20` |
| `max()` | Maximum value | `max([5, 2, 9, 1])` | `9` |
| `min()` | Minimum value | `min([5, 2, 9, 1])` | `2` |
| `count()` | Array length | `count([1, 2, 3])` | `3` |

#### Array Functions

| Function | Description | Example |
|----------|-------------|---------|
| `filter()` | Filter array by condition | `filter([1,2,3,4], x => x > 2)` → `[3,4]` |
| `map()` | Transform array elements | `map([1,2,3], x => x * 2)` → `[2,4,6]` |

> **Note**: Functions are **case-insensitive** (`sum`, `SUM`, `Sum` all work)

### Control Flow

#### If-Else Conditional

**Syntax:**
```spec
result = if (condition) trueValue else falseValue
```

**Examples:**
```spec
freeShipping = if (price >= 30000) true else false
grade = if (score >= 90) "A" else "B"
discount = if (isMember == true) 0.2 else 0.1
```

### Complete Examples

#### Example 1: E-commerce Pricing
```spec
// Korean variable names supported
기본가격 = 50000
회원할인율 = 0.15
쿠폰할인 = 5000
최종가격 = 기본가격 * (1 - 회원할인율) - 쿠폰할인
적립금 = 최종가격 * 0.05
무료배송 = if (최종가격 >= 30000) true else false
```

#### Example 2: Grade Calculation
```spec
scores = [85, 90, 78, 92, 88]
총점 = sum(scores)
평균 = avg(scores)
최고점 = max(scores)
최저점 = min(scores)
합격여부 = if (평균 >= 80) "합격" else "불합격"
```

#### Example 3: Inventory Management
```spec
재고 = [100, 50, 200, 75, 120]
총재고 = sum(재고)
평균재고 = avg(재고)
부족한재고 = filter(재고, x => x < 100)
부족개수 = count(부족한재고)
발주필요 = if (부족개수 > 2) true else false
```

### Language Limitations

- ❌ No loops (`for`, `while`)
- ❌ No custom function definitions (only built-ins)
- ❌ No string concatenation
- ✅ Variables must be declared before use
- ✅ Execution order: top to bottom

---

## 📦 Installation

### Method 1: VS Code Marketplace (Recommended)

> _Coming soon after official release_

1. Open VS Code
2. Go to Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Search for **"Spec-Engine"**
4. Click **Install**

### Method 2: Manual Installation

1. Download the latest `.vsix` file from [Releases](https://github.com/cow-coding/spec-engine/releases)
2. Open VS Code
3. Press `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows/Linux)
4. Type: `Extensions: Install from VSIX...`
5. Select the downloaded `.vsix` file

### Prerequisites

- **VS Code**: Version 1.85.0 or higher
- **Ollama**: Auto-installed by the extension (or install manually from [ollama.com](https://ollama.com))

---

## 🚀 Quick Start

### 1. Create a `.spec` File

```spec
// example.spec
price = 10000
discount = 0.2
finalPrice = price * (1 - discount)
```

### 2. Open Preview Panel

- Press `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows/Linux)
- Type: `Spec Engine: Open Preview`
- Or use the Command Palette

### 3. Generate PRD

1. Click **"✨ AI 기획서 생성"** button
2. Watch the progress bar (0% → 100%)
3. PRD appears when complete

### 4. Save Output

- Click **"💾 Save"** button
- Choose location and filename
- File saved as Markdown (`.md`)

---

## 📚 Usage Guide

### Writing .spec Files

1. **Create a new file** with `.spec` extension
2. **Write business logic** using supported syntax (see Language Reference)
3. **See real-time calculations** in the preview panel
4. **Generate PRD** when ready

### Real-time Logic Preview

- The preview panel shows **calculated values** as you type
- No need to run or compile — updates are instant
- Logic errors show as `"Error"` in the preview

### Generating PRD

1. Ensure **Ollama is running** (auto-starts if not)
2. Click **"✨ AI 기획서 생성"**
3. **Monitor progress**:
   - Loading animation with spinner
   - 4-stage status messages
   - Live percentage (5% increments)
4. **Cancel anytime** by clicking **"⏹️ 취소"**

### Customizing Settings

Go to: `Settings > Extensions > Spec Engine`

- Change AI model (Gemma 2B, Llama 3, etc.)
- Switch provider (Ollama ↔ Gemini Cloud)
- Set API keys (if using cloud)

---

## ⚙️ Requirements

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **OS** | macOS 10.15+ / Windows 10+ / Linux | Any modern OS |
| **RAM** | 2GB | 4GB+ |
| **Disk Space** | 2GB (for Ollama + model) | 5GB+ |
| **CPU** | Dual-core | Quad-core+ |

### Dependencies

- **Ollama** (auto-installed)
- **Gemma 2B Model** (~1.6GB, auto-downloaded on first use)

**Note**: The extension will:
1. Detect if Ollama is missing
2. Show installation instructions
3. Auto-download the model when needed

---

## 🔧 Extension Settings

This extension contributes the following settings:

### `spec-engine.aiProvider`
- **Type**: `string`
- **Default**: `"ollama"`
- **Options**: `"ollama"` | `"gemini"`
- **Description**: Select the AI provider (local or cloud)

### `spec-engine.localModelName`
- **Type**: `string`
- **Default**: `"gemma2"`
- **Description**: Ollama model name (e.g., `gemma2`, `llama3`, `qwen`)

### `spec-engine.apiKey`
- **Type**: `string`
- **Default**: `""`
- **Description**: Google Gemini API key (only needed if provider is `gemini`)

### `spec-engine.modelName`
- **Type**: `string`
- **Default**: `"gemini-1.5-flash"`
- **Description**: Gemini model version (only used with Gemini provider)

---

## 🏗️ How It Works

### Architecture Overview

```
┌─────────────┐
│  .spec File │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  SpecEngine     │  ← Real-time calculation
│  (Logic Parser) │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Ollama Server  │  ← Local AI (Gemma 2B)
│  (Auto-managed) │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  AI Service     │  ← Stream API + Progress
│  (Prompt Eng.)  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   PRD Output    │  ← Markdown with GitHub style
└─────────────────┘
```

### Prompt Engineering

- **Persona**: 10-year senior Product Manager
- **Few-Shot Learning**: Input/output examples included in prompt
- **Structured Output**: Predefined sections (Overview, Goals, Logic, Edge Cases, etc.)
- **Detail-Enhanced**: Explicit instructions for depth and specificity

### Stream API + Progress Estimation

1. **Streaming**: Ollama sends text chunks in real-time
2. **Throttle**: Updates every 300ms (smooth performance)
3. **Estimation**: Progress based on text length / 3000 chars (average PRD)
4. **Increments**: 5% steps (not 1%) for a better UX

---

## 📊 Performance

### Speed Benchmarks (Gemma 2B on Apple Silicon M2)

| Code Length | Generation Time | PRD Length |
|-------------|-----------------|------------|
| 10 lines | ~8 seconds | ~1500 chars |
| 30 lines | ~15 seconds | ~3000 chars |
| 50 lines | ~25 seconds | ~5000 chars |

### Resource Usage

- **Memory**: ~1.8GB (Ollama + Gemma 2B)
- **CPU**: 30-50% during generation
- **Disk**: ~1.6GB for model download

### User Experience Metrics

- **Logic Calculation**: < 100ms (instant)
- **Progress Updates**: Every 300ms (5% increments)
- **Rendering**: Smooth, no flickering
- **Cancellation**: Immediate abort

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Ollama not found"

**Solution:**
```bash
# macOS
brew install ollama

# Windows
winget install Ollama.Ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

#### 2. "Model 'gemma2' not found"

**Solution:**
- Click "다운로드 시작" when prompted
- Or manually run: `ollama pull gemma2`

#### 3. "Connection refused (localhost:11434)"

**Solution:**
- Restart VS Code
- Manually start Ollama: `ollama serve`
- Check firewall settings

#### 4. Generation takes too long

**Possible Causes:**
- Large input file (50+ lines)
- Slow machine / low RAM
- Model not fully loaded

**Solution:**
- Use shorter `.spec` files
- Close other applications
- Wait for first-time model loading (~30s)

#### 5. Progress bar stuck at 95%

**This is normal!** The progress caps at 95% until completion to avoid false 100% before the text is ready.

---

## 🚀 Roadmap

- [ ] **Syntax Highlighting**: `.spec` file colorization
- [ ] **Language Support**: English PRD output option
- [ ] **Custom Prompts**: User-defined PRD templates
- [ ] **Model Selector**: In-app model switcher (Gemma, Llama, Qwen, etc.)
- [ ] **PRD History**: Version control for generated documents
- [ ] **Diff View**: Compare PRD versions side-by-side
- [ ] **Export Options**: PDF, DOCX, HTML
- [ ] **Collaborative Mode**: Share PRDs via URL

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone the repo
git clone https://github.com/cow-coding/spec-engine.git
cd spec-engine

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run in VS Code
# Press F5 to open Extension Development Host
```

### Code of Conduct

Please be respectful and constructive. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### Inspiration

- Original idea inspired by: [YouTube - AI로 기획서 자동 생성하기](https://youtu.be/vENN6-d_3AQ?si=0dUEzJWaSuiwGzad)

### Built With

- **[Ollama](https://ollama.com/)**: Local LLM runtime
- **[Google Gemma 2](https://ai.google.dev/gemma)**: Base AI model (2B parameters)
- **[VS Code Extension API](https://code.visualstudio.com/api)**: Extension framework
- **[Marked.js](https://marked.js.org/)**: Markdown rendering

### Co-Authors

- **Claude Sonnet 4.5**: Pair programming partner for this project

---

## 💬 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/cow-coding/spec-engine/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/cow-coding/spec-engine/discussions)
- ⭐ **Star this repo** if you find it useful!

---

<div align="center">

**Made with ❤️ and AI**

[Report Bug](https://github.com/cow-coding/spec-engine/issues) • [Request Feature](https://github.com/cow-coding/spec-engine/discussions) • [Documentation](https://github.com/cow-coding/spec-engine/wiki)

</div>
