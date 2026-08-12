with open('src/components/LivePodium.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'src="https://drive.google.com/uc?export=view&id=1Nqk3jCqgImxHr2HfZb4NvWqofBO7N0AK" alt="Juara 1"', 
    'src="https://drive.google.com/uc?export=view&id=1Nqk3jCqgImxHr2HfZb4NvWqofBO7N0AK" alt="Juara 1" referrerPolicy="no-referrer"'
)
content = content.replace(
    'src="https://drive.google.com/uc?export=view&id=1Ul03BhQkZaAwqEsCbO1UmQ_xmcXp5B8i" alt="Juara 2"', 
    'src="https://drive.google.com/uc?export=view&id=1Ul03BhQkZaAwqEsCbO1UmQ_xmcXp5B8i" alt="Juara 2" referrerPolicy="no-referrer"'
)
content = content.replace(
    'src="https://drive.google.com/uc?export=view&id=1HQ2l_Uy0ymzlbfNCYZojRqLmmZLUXXZM" alt="Juara 3"', 
    'src="https://drive.google.com/uc?export=view&id=1HQ2l_Uy0ymzlbfNCYZojRqLmmZLUXXZM" alt="Juara 3" referrerPolicy="no-referrer"'
)

with open('src/components/LivePodium.tsx', 'w') as f:
    f.write(content)
