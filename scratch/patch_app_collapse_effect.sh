#!/bin/bash
sed -i '102a \
  React.useEffect(() => {\
    if (isSetupPanelOpen) {\
      window.dispatchEvent(new CustomEvent("collapseAll"));\
    }\
  }, [isSetupPanelOpen]);' src/App.tsx
