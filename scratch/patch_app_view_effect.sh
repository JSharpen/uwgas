#!/bin/bash
sed -i '94a \
  React.useEffect(() => {\
    window.dispatchEvent(new CustomEvent("collapseAll"));\
  }, [view]);' src/App.tsx
