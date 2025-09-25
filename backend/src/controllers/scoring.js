function calculateScore(template, responses) {
  if (!template.scoring_rules || !template.sections) return 0;
  const { weights = {}, threshold = 100, critical_questions = [] } = template.scoring_rules;
  let totalScore = 0;
  let maxScore = 0;

  template.sections.forEach(section => {
    let sectionScore = 0;
    let sectionMax = 0;
    section.questions.forEach(q => {
      let qScore = 0;
      // Example scoring logic (customize as needed)
      if (q.type === 'single_choice') {
        if (responses[section.section_id]?.[q.question_id] === 'Yes') qScore = 10;
      } else if (q.type === 'file_upload') {
        if (responses[section.section_id]?.[q.question_id]) qScore = 10;
      }
      // Add more types as needed
      sectionScore += qScore;
      sectionMax += 10;
    });
    // Apply section weight
    const weight = weights[section.section_id] || 0;
    totalScore += sectionMax ? (sectionScore / sectionMax) * weight : 0;
    maxScore += weight;
  });

  // Normalize to 100 if weights don't sum to 100
  if (maxScore !== 100 && maxScore > 0) totalScore = (totalScore / maxScore) * 100;
  return Math.round(totalScore);
}

module.exports = { calculateScore };