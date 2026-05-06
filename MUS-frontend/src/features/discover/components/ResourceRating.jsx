import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Stack, Rating, TextField, Button, 
  Avatar, CircularProgress, Alert, Divider
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { ratingService } from '@/services/ratingService';
import { useAuth } from '@/features/auth/context/AuthContext';

const ResourceRating = ({ resourceId }) => {
  const { user, isAuthenticated } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchRatings = async () => {
      if (!resourceId) return;
      setLoading(true);
      try {
        const [ratingsData, statsData] = await Promise.all([
          ratingService.listRatingsWithComments(resourceId),
          ratingService.getResourceRatingStatistics(resourceId)
        ]);
        
        if (mounted) {
          setRatings(Array.isArray(ratingsData?.data || ratingsData) ? (ratingsData.data || ratingsData) : []);
          setStats(statsData?.data || statsData || null);
        }
        
        if (isAuthenticated && mounted) {
          try {
            const myRatingData = await ratingService.getMyRatingForResource(resourceId);
            const myR = myRatingData?.data || myRatingData;
            if (myR && myR.score) {
              setMyRating(myR.score);
              setMyComment(myR.comment || '');
            }
          } catch (e) {
            // No existing rating found
          }
        }
      } catch (error) {
        if (mounted) console.error("Error fetching ratings", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRatings();
    return () => { mounted = false; };
  }, [resourceId, isAuthenticated]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setFeedback({ severity: 'warning', message: 'You must be logged in to leave a rating.' });
      return;
    }
    
    if (myRating < 1 || myRating > 5) {
      setFeedback({ severity: 'warning', message: 'Please select a star rating.' });
      return;
    }

    setSubmitLoading(true);
    setFeedback(null);
    try {
      await ratingService.addOrUpdateRating(resourceId, myRating, myComment);
      setFeedback({ severity: 'success', message: 'Your rating has been submitted successfully!' });
      // Refresh ratings list
      const updatedRatings = await ratingService.listRatingsWithComments(resourceId);
      setRatings(Array.isArray(updatedRatings?.data || updatedRatings) ? (updatedRatings.data || updatedRatings) : []);
      const updatedStats = await ratingService.getResourceRatingStatistics(resourceId);
      setStats(updatedStats?.data || updatedStats || null);
    } catch (error) {
      setFeedback({ severity: 'error', message: 'Failed to submit rating. Please try again.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Review Submission Section */}
      <Box sx={{ mb: 4, p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Leave a Review</Typography>
        
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">Your Rating:</Typography>
            <Rating 
              value={myRating} 
              onChange={(_, newValue) => setMyRating(newValue)} 
              size="large"
              emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
            />
          </Box>
          
          <TextField
            multiline
            rows={3}
            placeholder="What did you think of this resource? (Optional)"
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            fullWidth
            variant="outlined"
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={handleSubmit} 
              disabled={submitLoading || myRating === 0}
              sx={{ fontWeight: 600, borderRadius: 2 }}
            >
              {submitLoading ? <CircularProgress size={24} /> : 'Submit Review'}
            </Button>
          </Box>
          
          {feedback && <Alert severity={feedback.severity} sx={{ mt: 2 }}>{feedback.message}</Alert>}
        </Stack>
      </Box>

      {/* Stats Summary (Optional, if API provides it) */}
      {stats && stats.average > 0 && (
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3, px: 1 }}>
          <Typography variant="h3" fontWeight={800}>{Number(stats.average).toFixed(1)}</Typography>
          <Box>
            <Rating value={Number(stats.average)} readOnly precision={0.5} />
            <Typography variant="body2" color="text.secondary">Based on {stats.total_ratings || ratings.length} reviews</Typography>
          </Box>
        </Stack>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Reviews List */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3, px: 1 }}>Student Reviews</Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : ratings.length > 0 ? (
        <Stack spacing={3}>
          {ratings.map((review, idx) => (
            <Box key={review.id || idx} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: '1rem', fontWeight: 700 }}>
                  {String(review.user?.name || review.author_name || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {review.user?.name || review.author_name || 'Anonymous Student'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.created_at || review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  <Rating value={Number(review.score)} readOnly size="small" sx={{ mb: 1 }} />
                  {review.comment && (
                    <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-line' }}>
                      {review.comment}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No reviews yet. Be the first to review this resource!
        </Typography>
      )}
    </Box>
  );
};

export default ResourceRating;
