import React, { useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const categories = ['Merchandising', 'Stock', 'Quality'];

const styles = {
  container: {
    maxWidth: 800,
    margin: '2rem auto',
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    padding: '2rem'
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  input: {
    width: '100%',
    padding: '0.7rem',
    margin: '0.5rem 0',
    borderRadius: 5,
    border: '1px solid #ccc',
    fontSize: 16
  },
  textarea: {
    width: '100%',
    padding: '0.7rem',
    margin: '0.5rem 0',
    borderRadius: 5,
    border: '1px solid #ccc',
    fontSize: 16,
    minHeight: 60
  },
  select: {
    width: '100%',
    padding: '0.7rem',
    margin: '0.5rem 0',
    borderRadius: 5,
    border: '1px solid #ccc',
    fontSize: 16
  },
  button: {
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    padding: '0.6rem 1.5rem',
    fontWeight: 'bold',
    fontSize: 16,
    cursor: 'pointer',
    margin: '0.5rem 0.5rem 0.5rem 0'
  },
  smallButton: {
    background: '#eee',
    color: '#1976d2',
    border: 'none',
    borderRadius: 5,
    padding: '0.3rem 0.8rem',
    fontWeight: 'bold',
    fontSize: 14,
    cursor: 'pointer',
    marginLeft: 8
  },
  list: {
    listStyle: 'none',
    padding: 0
  },
  listItem: {
    padding: '0.7rem 0',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  preview: {
    border: '1px solid #aaa',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    background: '#f5f5f5'
  }
};

export default function TemplateWizard() {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState({
    name: '', description: '', category: '', sections: [], scoring_rules: {}, logic_rules: []
  });
  const [section, setSection] = useState({ title: '', description: '', questions: [] });
  const [editingSectionIdx, setEditingSectionIdx] = useState(null);
  const [question, setQuestion] = useState({ text: '', type: '', options: [], mandatory: false, min: '', max: '' });
  const [editingQuestionIdx, setEditingQuestionIdx] = useState(null);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(null);
  const [criticalQuestions, setCriticalQuestions] = useState([]);
  const [weights, setWeights] = useState({});
  const [isDraft, setIsDraft] = useState(false);
  const [logicRules, setLogicRules] = useState([]);
  const [logicInput, setLogicInput] = useState({ ifSection: '', ifQuestion: '', ifValue: '', action: '', targetSection: '', targetQuestion: '' });
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const token = localStorage.getItem('token');

  // Step 1: Template Setup
  if (step === 1) {
    return (
      <div style={styles.container}>
        <div style={styles.stepTitle}>Step 1: Template Setup</div>
        <input style={styles.input} placeholder="Template Name" value={template.name} onChange={e => setTemplate({ ...template, name: e.target.value })} required />
        <textarea style={styles.textarea} placeholder="Description" value={template.description} onChange={e => setTemplate({ ...template, description: e.target.value })} />
        <select style={styles.select} value={template.category} onChange={e => setTemplate({ ...template, category: e.target.value })}>
          <option value="">Select Category</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <div>
          <button style={styles.button} disabled={!template.name} onClick={() => setStep(2)}>Next</button>
          <button style={styles.smallButton} onClick={() => window.location.href = '/dashboard'}>Cancel</button>
        </div>
      </div>
    );
  }

  // Step 2: Define Sections (with drag-and-drop)
  if (step === 2) {
    const onDragEnd = (result) => {
      if (!result.destination) return;
      const arr = Array.from(template.sections);
      const [removed] = arr.splice(result.source.index, 1);
      arr.splice(result.destination.index, 0, removed);
      setTemplate({ ...template, sections: arr });
    };
    return (
      <div style={styles.container}>
        <div style={styles.stepTitle}>Step 2: Define Sections</div>
        <input style={styles.input} placeholder="Section Title" value={section.title} onChange={e => setSection({ ...section, title: e.target.value })} required />
        <textarea style={styles.textarea} placeholder="Section Description" value={section.description} onChange={e => setSection({ ...section, description: e.target.value })} />
        {editingSectionIdx === null ? (
          <button style={styles.button} disabled={!section.title} onClick={() => {
            setTemplate({ ...template, sections: [...template.sections, { ...section, questions: [] }] });
            setSection({ title: '', description: '', questions: [] });
          }}>Add Section</button>
        ) : (
          <button style={styles.button} onClick={() => {
            const arr = [...template.sections];
            arr[editingSectionIdx] = { ...section, questions: arr[editingSectionIdx].questions };
            setTemplate({ ...template, sections: arr });
            setSection({ title: '', description: '', questions: [] });
            setEditingSectionIdx(null);
          }}>Update Section</button>
        )}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <ul style={styles.list} {...provided.droppableProps} ref={provided.innerRef}>
                {template.sections.map((s, idx) => (
                  <Draggable key={idx} draggableId={`section-${idx}`} index={idx}>
                    {(provided) => (
                      <li style={styles.listItem} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <span>
                          <b>{s.title}</b>
                          <span style={{ color: '#888', marginLeft: 8 }}>{s.description}</span>
                        </span>
                        <span>
                          <button style={styles.smallButton} onClick={() => {
                            setSection({ title: s.title, description: s.description });
                            setEditingSectionIdx(idx);
                          }}>Edit</button>
                          <button style={styles.smallButton} onClick={() => {
                            const arr = [...template.sections];
                            arr.splice(idx, 1);
                            setTemplate({ ...template, sections: arr });
                          }}>Delete</button>
                        </span>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        <div>
          <button style={styles.button} onClick={() => setStep(1)}>Previous</button>
          <button style={styles.button} disabled={template.sections.length === 0} onClick={() => setStep(3)}>Next</button>
          <button style={styles.smallButton} onClick={() => window.location.href = '/dashboard'}>Cancel</button>
        </div>
      </div>
    );
  }

  // Step 3: Add Questions (with drag-and-drop, preview, barcode)
  if (step === 3) {
    const sectionOptions = template.sections.map((s, idx) => ({ label: s.title, value: idx }));
    const currentSection = selectedSectionIdx !== null ? template.sections[selectedSectionIdx] : null;

    const onDragEnd = (result) => {
      if (!result.destination || selectedSectionIdx === null) return;
      const arr = Array.from(template.sections[selectedSectionIdx].questions);
      const [removed] = arr.splice(result.source.index, 1);
      arr.splice(result.destination.index, 0, removed);
      const sectionsCopy = [...template.sections];
      sectionsCopy[selectedSectionIdx].questions = arr;
      setTemplate({ ...template, sections: sectionsCopy });
    };

    return (
      <div style={styles.container}>
        <div style={styles.stepTitle}>Step 3: Add Questions</div>
        <select style={styles.select} value={selectedSectionIdx ?? ''} onChange={e => setSelectedSectionIdx(Number(e.target.value))}>
          <option value="">Select Section</option>
          {sectionOptions.map((s, idx) => <option key={idx} value={s.value}>{s.label}</option>)}
        </select>
        {selectedSectionIdx !== null && (
          <>
            <input style={styles.input} placeholder="Question Text" value={question.text} onChange={e => setQuestion({ ...question, text: e.target.value })} />
            <select style={styles.select} value={question.type} onChange={e => setQuestion({ ...question, type: e.target.value })}>
              <option value="">Type</option>
              <option value="text">Text Input</option>
              <option value="number">Numeric Input</option>
              <option value="single_choice">Single Choice</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="dropdown">Dropdown</option>
              <option value="date">Date/Time</option>
              <option value="file_upload">File Upload</option>
              <option value="barcode">Barcode Scanner</option>
            </select>
            {(question.type === 'single_choice' || question.type === 'multiple_choice' || question.type === 'dropdown') &&
              <input style={styles.input} placeholder="Options (comma separated)" value={question.options.join(',')} onChange={e => setQuestion({ ...question, options: e.target.value.split(',') })} />
            }
            {question.type === 'number' && (
              <>
                <input style={styles.input} placeholder="Min" type="number" value={question.min} onChange={e => setQuestion({ ...question, min: e.target.value })} />
                <input style={styles.input} placeholder="Max" type="number" value={question.max} onChange={e => setQuestion({ ...question, max: e.target.value })} />
              </>
            )}
            <label style={{ marginRight: 10 }}>
              <input type="checkbox" checked={question.mandatory} onChange={e => setQuestion({ ...question, mandatory: e.target.checked })} />
              Mandatory
            </label>
            <label>
              <input type="checkbox" checked={criticalQuestions.includes(question.text)} onChange={e => {
                if (e.target.checked) setCriticalQuestions([...criticalQuestions, question.text]);
                else setCriticalQuestions(criticalQuestions.filter(q => q !== question.text));
              }} />
              Critical
            </label>
            <div>
              <button style={styles.smallButton} onClick={() => setPreviewQuestion(question)}>Preview Question</button>
              {previewQuestion && (
                <div style={styles.preview}>
                  <b>Preview:</b>
                  <div>Text: {previewQuestion.text}</div>
                  <div>Type: {previewQuestion.type}</div>
                  {previewQuestion.options && previewQuestion.options.length > 0 && (
                    <div>Options: {previewQuestion.options.join(', ')}</div>
                  )}
                  {previewQuestion.type === 'number' && (
                    <div>Range: {previewQuestion.min} - {previewQuestion.max}</div>
                  )}
                  <div>Mandatory: {previewQuestion.mandatory ? 'Yes' : 'No'}</div>
                  <button style={styles.smallButton} onClick={() => setPreviewQuestion(null)}>Close Preview</button>
                </div>
              )}
            </div>
            <div>
              {editingQuestionIdx === null ? (
                <button style={styles.button} disabled={!question.text} onClick={() => {
                  const arr = [...template.sections];
                  arr[selectedSectionIdx].questions = [...arr[selectedSectionIdx].questions, question];
                  setTemplate({ ...template, sections: arr });
                  setQuestion({ text: '', type: '', options: [], mandatory: false, min: '', max: '' });
                }}>Add Question</button>
              ) : (
                <button style={styles.button} onClick={() => {
                  const arr = [...template.sections];
                  arr[selectedSectionIdx].questions[editingQuestionIdx] = question;
                  setTemplate({ ...template, sections: arr });
                  setQuestion({ text: '', type: '', options: [], mandatory: false, min: '', max: '' });
                  setEditingQuestionIdx(null);
                }}>Update Question</button>
              )}
              <button style={styles.smallButton} onClick={() => setQuestion({ text: '', type: '', options: [], mandatory: false, min: '', max: '' })}>Clear</button>
            </div>
          </>
        )}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <ul style={styles.list} {...provided.droppableProps} ref={provided.innerRef}>
                {selectedSectionIdx !== null && template.sections[selectedSectionIdx].questions.map((q, qidx) => (
                  <Draggable key={qidx} draggableId={`question-${qidx}`} index={qidx}>
                    {(provided) => (
                      <li style={styles.listItem} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <span>
                          {q.text} <span style={{ color: '#888' }}>({q.type})</span>
                        </span>
                        <span>
                          <button style={styles.smallButton} onClick={() => {
                            setQuestion(q);
                            setEditingQuestionIdx(qidx);
                          }}>Edit</button>
                          <button style={styles.smallButton} onClick={() => {
                            const arr = [...template.sections];
                            arr[selectedSectionIdx].questions.splice(qidx, 1);
                            setTemplate({ ...template, sections: arr });
                          }}>Delete</button>
                        </span>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        <div>
          <button style={styles.button} onClick={() => setStep(2)}>Previous</button>
          <button style={styles.button} onClick={() => setStep(4)}>Next</button>
          <button style={styles.smallButton} onClick={() => window.location.href = '/dashboard'}>Cancel</button>
        </div>
      </div>
    );
  }

  // Step 4: Configure Logic (basic logic builder)
  if (step === 4) {
    return (
      <div style={styles.container}>
        <div style={styles.stepTitle}>Step 4: Configure Logic</div>
        <div>
          <b>If</b>
          <select style={styles.select} value={logicInput.ifSection} onChange={e => setLogicInput({ ...logicInput, ifSection: e.target.value, ifQuestion: '' })}>
            <option value="">Select Section</option>
            {template.sections.map((s, idx) => <option key={idx} value={idx}>{s.title}</option>)}
          </select>
          <select style={styles.select} value={logicInput.ifQuestion} onChange={e => setLogicInput({ ...logicInput, ifQuestion: e.target.value })} disabled={logicInput.ifSection === ''}>
            <option value="">Select Question</option>
            {logicInput.ifSection !== '' && template.sections[logicInput.ifSection].questions.map((q, idx) => (
              <option key={idx} value={idx}>{q.text}</option>
            ))}
          </select>
          <input style={styles.input} placeholder="Value" value={logicInput.ifValue} onChange={e => setLogicInput({ ...logicInput, ifValue: e.target.value })} />
          <b>then</b>
          <select style={styles.select} value={logicInput.action} onChange={e => setLogicInput({ ...logicInput, action: e.target.value })}>
            <option value="">Select Action</option>
            <option value="show">Show</option>
            <option value="hide">Hide</option>
            <option value="skip">Skip To</option>
          </select>
          <select style={styles.select} value={logicInput.targetSection} onChange={e => setLogicInput({ ...logicInput, targetSection: e.target.value, targetQuestion: '' })}>
            <option value="">Target Section</option>
            {template.sections.map((s, idx) => <option key={idx} value={idx}>{s.title}</option>)}
          </select>
          <select style={styles.select} value={logicInput.targetQuestion} onChange={e => setLogicInput({ ...logicInput, targetQuestion: e.target.value })} disabled={logicInput.targetSection === ''}>
            <option value="">Target Question</option>
            {logicInput.targetSection !== '' && template.sections[logicInput.targetSection].questions.map((q, idx) => (
              <option key={idx} value={idx}>{q.text}</option>
            ))}
          </select>
          <button style={styles.button} onClick={() => {
            setLogicRules([...logicRules, { ...logicInput }]);
            setLogicInput({ ifSection: '', ifQuestion: '', ifValue: '', action: '', targetSection: '', targetQuestion: '' });
          }}>Add Condition</button>
        </div>
        <ul style={styles.list}>
          {logicRules.map((rule, idx) => (
            <li style={styles.listItem} key={idx}>
              If [{template.sections[rule.ifSection]?.title}: {template.sections[rule.ifSection]?.questions[rule.ifQuestion]?.text}] = "{rule.ifValue}" then {rule.action} [{template.sections[rule.targetSection]?.title}: {template.sections[rule.targetSection]?.questions[rule.targetQuestion]?.text}]
            </li>
          ))}
        </ul>
        <div>
          <button style={styles.button} onClick={() => setStep(3)}>Previous</button>
          <button style={styles.button} onClick={() => setStep(5)}>Next</button>
          <button style={styles.smallButton} onClick={() => window.location.href = '/dashboard'}>Cancel</button>
        </div>
      </div>
    );
  }

  // Step 5: Scoring and Publish
  if (step === 5) {
    const handleWeightChange = (sectionId, value) => {
      setWeights({ ...weights, [sectionId]: Number(value) });
    };
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

    return (
      <div style={styles.container}>
        <div style={styles.stepTitle}>Step 5: Scoring and Publish</div>
        <label style={{ marginRight: 10 }}>
          <input type="checkbox" onChange={e => setTemplate({ ...template, scoring_rules: { ...template.scoring_rules, enabled: e.target.checked } })} />
          Enable Scoring
        </label>
        <input style={styles.input} placeholder="Compliance Threshold" type="number" onChange={e => setTemplate({ ...template, scoring_rules: { ...template.scoring_rules, threshold: Number(e.target.value) } })} />
        <h4>Section Weights (must sum to 100%)</h4>
        {template.sections.map((s, idx) => (
          <div key={idx}>
            {s.title}: <input style={{ ...styles.input, width: 100, display: 'inline-block' }} type="number" value={weights[s.title] || ''} onChange={e => handleWeightChange(s.title, e.target.value)} /> %
          </div>
        ))}
        <div style={{ margin: '10px 0', color: totalWeight === 100 ? '#388e3c' : '#d32f2f' }}>
          Total Weight: {totalWeight}%
        </div>
        <div>
          <button style={styles.button} onClick={() => setStep(4)}>Previous</button>
          <button style={styles.button} disabled={totalWeight !== 100} onClick={async () => {
            const scoring_rules = {
              ...template.scoring_rules,
              weights,
              critical_questions: criticalQuestions
            };
            const payload = { ...template, scoring_rules, logic_rules: logicRules };
            setIsDraft(false);
            await axios.post('http://localhost:5000/api/templates', payload, { headers: { Authorization: `Bearer ${token}` } });
            window.location.href = '/dashboard';
          }}>Publish Template</button>
          <button style={styles.button} onClick={async () => {
            const scoring_rules = {
              ...template.scoring_rules,
              weights,
              critical_questions: criticalQuestions
            };
            const payload = { ...template, scoring_rules, logic_rules: logicRules, is_published: false };
            setIsDraft(true);
            await axios.post('http://localhost:5000/api/templates', payload, { headers: { Authorization: `Bearer ${token}` } });
            window.location.href = '/dashboard';
          }}>Save as Draft</button>
          <button style={styles.smallButton} onClick={() => window.location.href = '/dashboard'}>Cancel</button>
        </div>
      </div>
    );
  }
}