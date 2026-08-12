import re

with open('src/components/LivePodium.tsx', 'r') as f:
    content = f.read()

# Remove the absolute top banners
content = content.replace(
    '<div className="absolute top-0 left-0 w-full bg-surface-variant text-on-surface-variant text-center py-2 rounded-t-lg font-bold text-label-sm z-10">RUNNER UP (2)</div>',
    ''
)
content = content.replace(
    '<div className="absolute top-0 left-0 w-full bg-primary-container text-on-primary-container text-center py-2 rounded-t-lg font-bold text-label-md flex items-center justify-center gap-2 shadow-sm z-10">\n                  <Trophy className="w-[18px] h-[18px] fill-current" /> CHAMPION (1)\n                </div>',
    ''
)
content = content.replace(
    '<div className="absolute top-0 left-0 w-full bg-[#CD7F32] text-white text-center py-2 rounded-t-lg font-bold text-label-sm z-10">3RD PLACE (3)</div>',
    ''
)

# Put back the labels into the normal flow
content = content.replace(
    '<div className="px-4 text-center mt-4 flex flex-col items-center w-full">',
    """<div className="px-4 text-center mt-4 flex flex-col items-center w-full">
                      <div className="bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold mb-3 uppercase tracking-widest shadow-sm">RUNNER UP (2)</div>""",
    1
)

content = content.replace(
    '<div className="px-4 text-center mt-4 flex flex-col items-center w-full">',
    """<div className="px-4 text-center mt-4 flex flex-col items-center w-full">
                      <div className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-label-sm font-bold flex items-center gap-1.5 mb-3 shadow-sm uppercase tracking-widest">
                        <Trophy className="w-3.5 h-3.5 fill-current" /> CHAMPION (1)
                      </div>""",
    1
)

content = content.replace(
    '<div className="px-4 text-center mt-4 flex flex-col items-center w-full">',
    """<div className="px-4 text-center mt-4 flex flex-col items-center w-full">
                      <div className="bg-[#CD7F32] text-white px-3 py-1 rounded-full text-[10px] font-bold mb-3 uppercase tracking-widest shadow-sm">3RD PLACE (3)</div>""",
    1
)

# Adjust avatar positions to overlap naturally again (half in, half out)
content = content.replace('absolute -top-[72px]', 'absolute -top-10')
content = content.replace('absolute -top-[100px]', 'absolute -top-14')

# Restore pt sizes to accommodate half-in avatars
content = content.replace('pb-6 pt-12 order-2', 'pb-6 pt-14 order-2')
content = content.replace('pb-6 pt-12 order-3', 'pb-6 pt-14 order-3')
content = content.replace('pb-6 pt-14 order-1', 'pb-6 pt-16 order-1')

# Restore container pt
content = content.replace('pt-28 md:pt-36 pb-8', 'pt-16 md:pt-24 pb-8')

with open('src/components/LivePodium.tsx', 'w') as f:
    f.write(content)
