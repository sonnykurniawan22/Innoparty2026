import re

with open('src/components/LivePodium.tsx', 'r') as f:
    content = f.read()

# For runner up and 3rd place
content = content.replace(
    '<div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">',
    '<div className="absolute -top-[72px] left-1/2 -translate-x-1/2 flex flex-col items-center z-20">'
)

# For champion
content = content.replace(
    '<div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">',
    '<div className="absolute -top-[100px] left-1/2 -translate-x-1/2 flex flex-col items-center z-20">'
)

# Also fix the top gap in the container to allow for the avatars sticking out
content = content.replace(
    'pt-16 md:pt-24 pb-8',
    'pt-28 md:pt-36 pb-8'
)

# Restore the padding to normal inside the cards
content = content.replace('pb-6 pt-16 order-2', 'pb-6 pt-12 order-2')
content = content.replace('pb-6 pt-16 order-3', 'pb-6 pt-12 order-3')
content = content.replace('pb-6 pt-24 order-1', 'pb-6 pt-14 order-1')

with open('src/components/LivePodium.tsx', 'w') as f:
    f.write(content)
