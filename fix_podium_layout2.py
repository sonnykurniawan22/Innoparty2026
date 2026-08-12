import re

with open('src/components/LivePodium.tsx', 'r') as f:
    content = f.read()

# Fix layout for Runner Up and 3rd Place
content = content.replace(
    '<div className="absolute top-0 right-0 bg-surface-variant text-on-surface-variant px-3 py-1 rounded-bl-lg rounded-tr-xl text-label-sm font-bold z-10">RUNNER UP (2)</div>',
    '<div className="absolute top-0 left-0 w-full bg-surface-variant text-on-surface-variant text-center py-2 rounded-t-lg font-bold text-label-sm z-10">RUNNER UP (2)</div>'
)

content = content.replace(
    '<div className="absolute top-0 right-0 bg-[#CD7F32] text-white px-3 py-1 rounded-bl-lg rounded-tr-xl text-label-sm font-bold z-10">3RD PLACE (3)</div>',
    '<div className="absolute top-0 left-0 w-full bg-[#CD7F32] text-white text-center py-2 rounded-t-lg font-bold text-label-sm z-10">3RD PLACE (3)</div>'
)

# Put back the Google Drive links
content = content.replace(
    'src="/robot_1.png"', 
    'src="https://drive.google.com/uc?export=view&id=1Nqk3jCqgImxHr2HfZb4NvWqofBO7N0AK" referrerPolicy="no-referrer"'
)
content = content.replace(
    'src="/robot_2.png"', 
    'src="https://drive.google.com/uc?export=view&id=1Ul03BhQkZaAwqEsCbO1UmQ_xmcXp5B8i" referrerPolicy="no-referrer"'
)
content = content.replace(
    'src="/robot_3.png"', 
    'src="https://drive.google.com/uc?export=view&id=1HQ2l_Uy0ymzlbfNCYZojRqLmmZLUXXZM" referrerPolicy="no-referrer"'
)

# Increase pt padding for cards to avoid overlap with the new top bar
content = content.replace(
    'pb-6 pt-14 order-2',
    'pb-6 pt-16 order-2'
)
content = content.replace(
    'pb-6 pt-14 order-3',
    'pb-6 pt-16 order-3'
)
content = content.replace(
    'pb-6 pt-20 order-1',
    'pb-6 pt-24 order-1'
)

with open('src/components/LivePodium.tsx', 'w') as f:
    f.write(content)
