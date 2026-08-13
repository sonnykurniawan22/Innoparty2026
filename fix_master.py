import re

with open('src/components/MasterParticipants.tsx', 'r') as f:
    content = f.read()

# Add teamCode state
content = content.replace("const [projectTitle, setProjectTitle] = useState('');", "const [teamCode, setTeamCode] = useState('');\n  const [projectTitle, setProjectTitle] = useState('');")

# Reset form
content = content.replace("setProjectTitle('');", "setTeamCode('');\n    setProjectTitle('');")

# Edit
content = content.replace("setProjectTitle(p.projectTitle);", "setTeamCode(p.teamCode || '');\n    setProjectTitle(p.projectTitle);")

# Submit validation
content = content.replace("if (!name.trim() || !projectTitle.trim()) return;", "if (!name.trim() || !projectTitle.trim() || !teamCode.trim()) { alert('Nama, Kode Tim, dan Judul wajib diisi'); return; }")

# Add/Update payload
payload_old = """    const payload = {
      name,
      projectTitle,
      levelCategory,"""

payload_new = """    const payload = {
      name,
      teamCode,
      projectTitle,
      levelCategory,"""
content = content.replace(payload_old, payload_new)

# Table headers
content = content.replace('<th className="py-3 px-3">NAMA TIM / PESERTA</th>', '<th className="py-3 px-3">NAMA TIM / PESERTA</th>\n                  <th className="py-3 px-3">KODE TIM</th>')

# Table row
row_old = """                          <div className="font-bold text-slate-900">{p.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate">
                      {p.projectTitle}
                    </td>"""

row_new = """                          <div className="font-bold text-slate-900">{p.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {p.teamCode || '-'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate">
                      {p.projectTitle}
                    </td>"""
content = content.replace(row_old, row_new)

# Form input
input_old = """            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Tim / Peserta:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Conan"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
              />
            </div>"""

input_new = input_old + """
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kode Tim (Diambil dari Excel):
              </label>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="Misal: R-01"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
              />
            </div>"""
content = content.replace(input_old, input_new)

with open('src/components/MasterParticipants.tsx', 'w') as f:
    f.write(content)
