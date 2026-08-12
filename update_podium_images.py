with open('src/components/LivePodium.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'src="/robot_1.png"', 
    'src="https://drive.google.com/uc?export=view&id=1Nqk3jCqgImxHr2HfZb4NvWqofBO7N0AK"'
)
content = content.replace(
    'src="/robot_2.png"', 
    'src="https://drive.google.com/uc?export=view&id=1Ul03BhQkZaAwqEsCbO1UmQ_xmcXp5B8i"'
)
content = content.replace(
    'src="/robot_3.png"', 
    'src="https://drive.google.com/uc?export=view&id=1HQ2l_Uy0ymzlbfNCYZojRqLmmZLUXXZM"'
)

with open('src/components/LivePodium.tsx', 'w') as f:
    f.write(content)
