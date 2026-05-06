import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Stack, TextField, Button, 
  Avatar, CircularProgress, Alert, Divider, IconButton
} from '@mui/material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import qaService from '@/services/qaService';
import { useAuth } from '@/features/auth/context/AuthContext';

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
        // Assuming qaService accepts target_id and target_type
        const data = await qaService.listQuestions({ target_id: resourceId, target_type: 'resource' });
        if (mounted) {
          setQuestions(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (mounted) console.error("Error fetching questions", error);
        // Fallback to empty if API is missing or fails
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
        title: newQuestion.substring(0, 100), // backend might require title
        content: newQuestion 
      });
      setFeedback({ severity: 'success', message: 'Your question has been posted!' });
      setNewQuestion('');
      
      // Refresh list
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
      {/* Question Submission Section */}
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

      {/* Questions List */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3, px: 1 }}>Student Questions ({questions.length})</Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : questions.length > 0 ? (
        <Stack spacing={3}>
          {questions.map((q, idx) => (
            <Box key={q.id || idx} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
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
                  
                  {/* Mock Answers Section */}
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Button size="small" startIcon={<QuestionAnswerIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                      {q.answers_count || 0} Answers
                    </Button>
                    <Button size="small" startIcon={<ThumbUpAltOutlinedIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                      Helpful ({q.likes_count || 0})
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Box>
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
