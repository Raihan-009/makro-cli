# makro-cli

AI coding assistant for the terminal.

## Install

```bash
npm install -g makro-cli
```

Requires Node.js 20 or later.

## Usage

Set your credentials, then run:

```bash
export MAKRO_TOKEN=your-token
export MAKRO_BASE_URL=https://your-endpoint

makro-cli
```

Type `/help` inside the session to see available commands.

## Resume a session

```bash
makro-cli --resume <session-id>
```
