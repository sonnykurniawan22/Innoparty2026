with open('src/components/AdminSettings.tsx', 'r') as f:
    content = f.read()

content = content.replace("clearAllPublicVotes, addScore, updateScore } from '../lib/contestService';", "clearAllPublicVotes, saveJudgeScore } from '../lib/contestService';")

# replace the batch block
old_block = """          const existingScore = scores.find(s => s.participantId === p.id && s.judgeId === judgeId);
          if (existingScore) {
            batchPromises.push(updateScore(existingScore.id, {
              criteriaScores: { performance: row.performance, perbaikanMateri: row.perbaikanMateri },
              totalScore: row.performance + row.perbaikanMateri,
              submittedAt: new Date().toISOString()
            }));
          } else {
            batchPromises.push(addScore({
              participantId: p.id,
              judgeId: judgeId as 1 | 2 | 3,
              criteriaScores: { performance: row.performance, perbaikanMateri: row.perbaikanMateri },
              totalScore: row.performance + row.perbaikanMateri,
              notes: "Disinkronisasi dari Google Sheets",
              submittedAt: new Date().toISOString()
            }));
          }"""

new_block = """          batchPromises.push(saveJudgeScore(
            p.id,
            judgeId as 1 | 2 | 3,
            { performance: row.performance, perbaikanMateri: row.perbaikanMateri },
            "Disinkronisasi dari Google Sheets"
          ));"""

content = content.replace(old_block, new_block)

with open('src/components/AdminSettings.tsx', 'w') as f:
    f.write(content)
