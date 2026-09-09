#!/bin/bash
sed -i '/window.dispatchEvent(new CustomEvent('\''collapseAll'\''));/d' src/App.tsx
