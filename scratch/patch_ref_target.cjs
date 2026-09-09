const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Move the ref from the sticky header to the static section container
appCode = appCode.replace(
  '<div ref={headerRef} className="sticky top-2 z-20 flex items-center justify-between mb-4 px-2 py-2 bg-[#262626]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-300">',
  '<div className="sticky top-2 z-20 flex items-center justify-between mb-4 px-2 py-2 bg-[#262626]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-300">'
);
appCode = appCode.replace(
  '<section className="flex flex-col gap-0 w-full max-w-[576px] mx-auto">',
  '<section ref={headerRef} className="flex flex-col gap-0 w-full max-w-[576px] mx-auto">'
);

// 2. Update the useEffect logic
// The Progression Header is the first child of the section.
// We want its height + margin-bottom to know how much space it takes at the top of the section.
// Wait, if it's sticky, does it change height? No.
// Let's just use the section's absolute top + header's height.
// Actually, since the container is `flex flex-col gap-4`, we know exactly what is above it!
// Let's just use the section's absolute offsetTop. 
// The bottom of the header in its resting state is: 
// section.offsetTop + header.offsetHeight + 16 (mb-4)
appCode = appCode.replace(
  /const rect = headerRef\.current\.getBoundingClientRect\(\);\n\s*document\.documentElement\.style\.setProperty\('--progression-header-bottom', `\$\{rect\.bottom\}px`\);/g,
  `const section = headerRef.current;
        const stickyHeader = section.firstElementChild as HTMLElement;
        if (stickyHeader) {
          // absolute top relative to the viewport (ignoring scroll) is just section's offsetTop relative to the document
          // minus window.scrollY? No, we want the resting position relative to the TOP of the viewport!
          // So if the user is scrolled to the very top (scrollY = 0), where is the header?
          // It's at section.offsetTop!
          // So the resting bottom edge is: section.offsetTop + stickyHeader.offsetHeight
          const restingBottom = section.offsetTop + stickyHeader.offsetHeight;
          document.documentElement.style.setProperty('--progression-header-bottom', \`\${restingBottom}px\`);
        }`
);

fs.writeFileSync('src/App.tsx', appCode);
