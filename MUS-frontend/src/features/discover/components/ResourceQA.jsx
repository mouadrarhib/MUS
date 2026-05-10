import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Stack, TextField, Button, 
  Avatar, CircularProgress, Alert, Divider, IconButton, Collapse
} from '@mui/material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import qaService from '@/services/qaService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useNotification } from '@/shared/components/ui';

const QuestionItem = ({ q }) => {
  const { user, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [expanded, setExpanded] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAnswers = async () => {
    setLoadingAnswers(true);
    try {
      const data = await qaService.listAnswersByQuestion(q.id || q._id);
      setAnswers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load answers:', err);
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleToggle = () => {
    if (!expanded && answers.length === 0) {
      fetchAnswers();
    }
    setExpanded(!expanded);
  };

  const handleSubmitAnswer = async () => {
    if (!isAuthenticated) {
      showError('You must be logged in to answer.');
      return;
    }
    if (!newAnswer.trim()) return;
    setSubmitLoading(true);
    try {
      await qaService.createAnswer(q.id || q._id, { content: newAnswer });
      showSuccess('Your answer has been posted!');
      setNewAnswer('');
      await fetchAnswers();
    } catch (err) {
      showError('Failed to post answer. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.main', fontSize: '1rem', fontWeight: 700 }}>
          {String(q.author?.name || q.user?.name || 'S').charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {q.author?.name || q.user?.name || 'Student'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(q.created_at || q.createdAt || Date.now()).toLocaleDateString()}
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.primary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
            {q.content || q.title}
          </Typography>
          
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button 
              size="small" 
              onClick={handleToggle}
              startIcon={expanded ? <ExpandMoreIcon sx={{ transform: 'rotate(180deg)', fontSize: 16 }} /> : <QuestionAnswerIcon sx={{ fontSize: 16 }} />} 
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              {q.answers_count || answers.length || 0} Answers
            </Button>
            <Button size="small" startIcon={<ThumbUpAltOutlinedIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', color: 'text.secondary' }}>
              Helpful ({q.likes_count || 0})
            </Button>
          </Stack>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
              {loadingAnswers ? (
                <CircularProgress size={20} sx={{ my: 2 }} />
              ) : (
                <Stack spacing={2}>
                  {answers.map((a, idx) => (
                    <Box key={a.id || idx} sx={{ p: 1.5, borderRadius: 1, bgcolor: a.is_accepted ? 'success.50' : 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={600}>
                          {a.author?.name || a.user?.name || 'Peer'}
                        </Typography>
                        {a.is_accepted && <CheckCircleIcon color="success" sx={{ fontSize: 14 }} />}
                      </Stack>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{a.content}</Typography>
                    </Box>
                  ))}
                  
                  <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 2 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>{user?.full_name?.charAt(0) || 'U'}</Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        placeholder="Write your answer..."
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                      />
                      <Button 
                        variant="contained" 
                        size="small" 
                        sx={{ mt: 1 }} 
                        onClick={handleSubmitAnswer}
                        disabled={submitLoading || !newAnswer.trim()}
                      >
                        {submitLoading ? <CircularProgress size={16} /> : 'Reply'}
                      </Button>
                    </Box>
                  </Stack>
                </Stack>
              )}
            </Box>
          </Collapse>
        </Box>
      </Stack>
    </Box>
  );
};

const ResourceQA = ({ resourceId }) => {
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchQuestions = async () => {
      if (!resourceId) return;
      setLoading(true);
      try {
        const data = await qaService.listQuestions({ target_id: resourceId, target_type: 'resource' });
        if (mounted) setQuestions(Array.isArray(data) ? data : []);
      } catch (error) {
        if (mounted) console.error("Error fetching questions", error);
        if (mounted) setQuestions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchQuestions();
    return () => { mounted = false; };
  }, [resourceId]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setFeedback({ severity: 'warning', message: 'You must be logged in to ask a question.' });
      return;
    }
    if (!newQuestion.trim()) {
      setFeedback({ severity: 'warning', message: 'Question cannot be empty.' });
      return;
    }
    setSubmitLoading(true);
    setFeedback(null);
    try {
      await qaService.createQuestion({ 
        target_id: resourceId, 
        target_type: 'resource',
        title: newQuestion.substring(0, 100),
        content: newQuestion 
      });
      setFeedback({ severity: 'success', message: 'Your question has been posted!' });
      setNewQuestion('');
      const data = await qaService.listQuestions({ target_id: resourceId, target_type: 'resource' });
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      setFeedback({ severity: 'error', message: 'Failed to post question. Please try again later.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 4, p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <QuestionAnswerIcon color="primary" /> Ask a Question
        </Typography>
        <Stack spacing={2}>
          <TextField
            multiline
            rows={3}
            placeholder="What do you want to know about this resource?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={handleSubmit} 
              disabled={submitLoading || !newQuestion.trim()}
              sx={{ fontWeight: 600, borderRadius: 2 }}
            >
              {submitLoading ? <CircularProgress size={24} /> : 'Post Question'}
            </Button>
          </Box>
          {feedback && <Alert severity={feedback.severity} sx={{ mt: 2 }}>{feedback.message}</Alert>}
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" fontWeight={700} sx={{ mb: 3, px: 1 }}>Student Questions ({questions.length})</Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : questions.length > 0 ? (
        <Stack spacing={3}>
          {questions.map((q, idx) => (
            <QuestionItem key={q.id || idx} q={q} />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No questions have been asked yet. Be the first to ask!
        </Typography>
      )}
    </Box>
  );
};

export default ResourceQA;
