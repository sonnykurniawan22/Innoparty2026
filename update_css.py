import json

colors = {
    "inverse-on-surface": "#f0f1f2",
    "secondary-fixed-dim": "#bbc9d0",
    "on-secondary": "#ffffff",
    "surface-bright": "#f8f9fa",
    "on-background": "#191c1d",
    "on-error": "#ffffff",
    "on-secondary-container": "#57656b",
    "primary-container": "#ffc107",
    "secondary-container": "#d4e2e9",
    "tertiary": "#6a5b56",
    "primary": "#785900",
    "tertiary-fixed-dim": "#d6c3bc",
    "surface-variant": "#e1e3e4",
    "inverse-surface": "#2e3132",
    "error-container": "#ffdad6",
    "on-secondary-fixed-variant": "#3c494f",
    "primary-fixed-dim": "#fabd00",
    "on-tertiary-container": "#60524e",
    "on-tertiary-fixed-variant": "#51443f",
    "outline": "#827660",
    "surface-dim": "#d9dadb",
    "on-secondary-fixed": "#101d23",
    "primary-fixed": "#ffdf9e",
    "on-primary": "#ffffff",
    "background": "#f8f9fa",
    "on-primary-container": "#6d5100",
    "surface-container": "#edeeef",
    "on-surface": "#191c1d",
    "on-surface-variant": "#4f4632",
    "tertiary-container": "#dac7c1",
    "surface-tint": "#785900",
    "secondary-fixed": "#d7e5ec",
    "on-primary-fixed-variant": "#5b4300",
    "inverse-primary": "#fabd00",
    "error": "#ba1a1a",
    "on-tertiary": "#ffffff",
    "surface-container-highest": "#e1e3e4",
    "surface-container-high": "#e7e8e9",
    "surface-container-lowest": "#ffffff",
    "surface": "#f8f9fa",
    "on-primary-fixed": "#261a00",
    "outline-variant": "#d4c5ab",
    "surface-container-low": "#f3f4f5",
    "tertiary-fixed": "#f2ded8",
    "on-error-container": "#93000a",
    "secondary": "#536067",
    "on-tertiary-fixed": "#231915"
}

with open("src/index.css", "r") as f:
    content = f.read()

theme_block = "@theme {\n  --font-sans: \"Inter\", ui-sans-serif, system-ui, sans-serif;\n  --font-display: \"Space Grotesk\", ui-sans-serif, system-ui, sans-serif;\n"
for name, val in colors.items():
    theme_block += f"  --color-{name}: {val};\n"

# adding fonts
theme_block += """
  --text-headline-xl: 32px;
  --text-headline-xl--line-height: 40px;
  --text-headline-xl--letter-spacing: -0.02em;
  --text-headline-xl--font-weight: 700;
  
  --text-headline-lg: 24px;
  --text-headline-lg--line-height: 32px;
  --text-headline-lg--letter-spacing: -0.01em;
  --text-headline-lg--font-weight: 700;
  
  --text-headline-md: 20px;
  --text-headline-md--line-height: 28px;
  --text-headline-md--font-weight: 600;

  --text-body-lg: 16px;
  --text-body-lg--line-height: 24px;
  --text-body-lg--font-weight: 400;

  --text-body-md: 14px;
  --text-body-md--line-height: 20px;
  --text-body-md--font-weight: 400;

  --text-body-sm: 12px;
  --text-body-sm--line-height: 16px;
  --text-body-sm--font-weight: 400;

  --text-label-lg: 14px;
  --text-label-lg--line-height: 20px;
  --text-label-lg--letter-spacing: 0.05em;
  --text-label-lg--font-weight: 600;

  --text-label-md: 12px;
  --text-label-md--line-height: 16px;
  --text-label-md--letter-spacing: 0.05em;
  --text-label-md--font-weight: 600;

  --text-label-sm: 10px;
  --text-label-sm--line-height: 12px;
  --text-label-sm--letter-spacing: 0.08em;
  --text-label-sm--font-weight: 700;
"""

theme_block += "}\n\n.podium-card {\n    transition: transform 0.3s ease, box-shadow 0.3s ease;\n}\n.podium-card:hover {\n    transform: translateY(-4px);\n}\n.champion-card {\n    box-shadow: 0px 12px 30px rgba(255, 193, 7, 0.15);\n}\n"

new_content = content.replace('@theme {\n  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;\n  --font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;\n}', theme_block)

with open("src/index.css", "w") as f:
    f.write(new_content)
