import re

with open('src/components/JudgeQRModal.tsx', 'r') as f:
    content = f.read()

# Make sure we add participant to the URL!
old_links = """  const links = [
    { key: 'juri1', label: 'JURI 1 (ANONYMOUS)', url: `${origin}/?juri=1`, desc: 'Akses Khusus Form Penilaian Juri 1', badgeColor: 'bg-emerald-600' },
    { key: 'juri2', label: 'JURI 2 (ANONYMOUS)', url: `${origin}/?juri=2`, desc: 'Akses Khusus Form Penilaian Juri 2', badgeColor: 'bg-blue-600' },
    { key: 'juri3', label: 'JURI 3 (REFEREE VAR)', url: `${origin}/?juri=3`, desc: 'Akses Khusus Form Penilaian Juri 3', badgeColor: 'bg-amber-600' },
    { key: 'podium', label: 'LIVE PODIUM SCOREBOARD', url: `${origin}/?view=podium`, desc: 'Tampilan Live Klasemen & Panggung Juara Real-time', badgeColor: 'bg-purple-600' },
  ];"""

new_links = """  const links = [
    { key: 'juri1', label: 'JURI 1 (ANONYMOUS)', url: `${origin}/?juri=1&participant=${selectedParticipantId}`, desc: 'Akses Khusus Form Penilaian Juri 1', badgeColor: 'bg-emerald-600' },
    { key: 'juri2', label: 'JURI 2 (ANONYMOUS)', url: `${origin}/?juri=2&participant=${selectedParticipantId}`, desc: 'Akses Khusus Form Penilaian Juri 2', badgeColor: 'bg-blue-600' },
    { key: 'juri3', label: 'JURI 3 (REFEREE VAR)', url: `${origin}/?juri=3&participant=${selectedParticipantId}`, desc: 'Akses Khusus Form Penilaian Juri 3', badgeColor: 'bg-amber-600' },
  ];"""
content = content.replace(old_links, new_links)

# Fix the generateAllQRs function to depend on selectedParticipantId
old_effect = """  useEffect(() => {
    async function generateAllQRs() {
      const newMap: { [key: string]: string } = {};
      for (const item of links) {
        try {
          const dataUrl = await QRCode.toDataURL(item.url, {
            width: 512,
            margin: 3,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          newMap[item.key] = dataUrl;
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      }
      setQrMap(newMap);
    }
    generateAllQRs();
  }, []);"""

new_effect = """  useEffect(() => {
    async function generateAllQRs() {
      if (!selectedParticipantId) {
        setQrMap({});
        return;
      }
      const newMap: { [key: string]: string } = {};
      for (const item of links) {
        try {
          const dataUrl = await QRCode.toDataURL(item.url, {
            width: 512,
            margin: 3,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          newMap[item.key] = dataUrl;
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      }
      setQrMap(newMap);
    }
    generateAllQRs();
  }, [selectedParticipantId, origin]);"""
content = content.replace(old_effect, new_effect)

# Inject the select box into the header
header_regex = r'(<div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl text-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">.*?</div>)'
header_match = re.search(header_regex, content, re.DOTALL)
if header_match:
    old_header = header_match.group(1)
    new_header = old_header + """
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm mt-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Peserta Inovasi (Otomatis Update QR Code)</label>
        <select 
          value={selectedParticipantId}
          onChange={(e) => setSelectedParticipantId(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="">-- Pilih Peserta --</option>
          {participants.map(p => (
            <option key={p.id} value={p.id}>{p.name} - {p.teamName} ({p.levelCategory})</option>
          ))}
        </select>
      </div>"""
    content = content.replace(old_header, new_header)

with open('src/components/JudgeQRModal.tsx', 'w') as f:
    f.write(content)
