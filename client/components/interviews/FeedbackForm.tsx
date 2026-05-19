'use client';

import React, { useState } from 'react';
import { FiStar, FiSend, FiX } from 'react-icons/fi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => void;
  candidateName?: string;
  jobTitle?: string;
}

export interface FeedbackData {
  technicalSkills: number;
  communication: number;
  problemSolving: number;
  confidence: number;
  recommendation: 'selected' | 'hold' | 'rejected';
  comments: string;
}

const StarRating: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <FiStar
            size={24}
            style={{
              color: star <= value ? '#f59e0b' : 'var(--color-border)',
              fill: star <= value ? '#f59e0b' : 'none',
            }}
          />
        </button>
      ))}
    </div>
  );
};

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  candidateName,
  jobTitle,
}) => {
  const [ratings, setRatings] = useState({
    technicalSkills: 3,
    communication: 3,
    problemSolving: 3,
    confidence: 3,
  });
  const [recommendation, setRecommendation] = useState<'selected' | 'hold' | 'rejected'>('hold');
  const [comments, setComments] = useState('');

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings({ ...ratings, [category]: value });
  };

  const handleSubmit = () => {
    const feedback: FeedbackData = {
      ...ratings,
      recommendation,
      comments,
    };
    onSubmit(feedback);
    // Reset form
    setRatings({
      technicalSkills: 3,
      communication: 3,
      problemSolving: 3,
      confidence: 3,
    });
    setRecommendation('hold');
    setComments('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Interview Feedback" size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        {/* Candidate Info */}
        {(candidateName || jobTitle) && (
          <div style={{ background: 'var(--color-background)', padding: 'var(--space-md)', borderRadius: 'var(--radius)' }}>
            {candidateName && (
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 4 }}>
                Candidate: {candidateName}
              </p>
            )}
            {jobTitle && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
                Position: {jobTitle}
              </p>
            )}
          </div>
        )}

        {/* Rating Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <RatingSection
            label="Technical Skills"
            description="Assess technical knowledge and coding abilities"
            value={ratings.technicalSkills}
            onChange={(value) => handleRatingChange('technicalSkills', value)}
          />
          <RatingSection
            label="Communication"
            description="Evaluate clarity of expression and listening skills"
            value={ratings.communication}
            onChange={(value) => handleRatingChange('communication', value)}
          />
          <RatingSection
            label="Problem Solving"
            description="Judge analytical thinking and approach to challenges"
            value={ratings.problemSolving}
            onChange={(value) => handleRatingChange('problemSolving', value)}
          />
          <RatingSection
            label="Confidence"
            description="Assess self-assurance and presentation"
            value={ratings.confidence}
            onChange={(value) => handleRatingChange('confidence', value)}
          />
        </div>

        {/* Recommendation */}
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>
            Recommendation
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {[
              { value: 'selected', label: 'Selected', color: '#22c55e' },
              { value: 'hold', label: 'Hold', color: '#f59e0b' },
              { value: 'rejected', label: 'Rejected', color: '#ef4444' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRecommendation(option.value as any)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius)',
                  border: `2px solid ${recommendation === option.value ? option.color : 'var(--color-border)'}`,
                  background: recommendation === option.value ? `${option.color}10` : 'var(--color-surface)',
                  color: recommendation === option.value ? option.color : 'var(--color-foreground)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (recommendation !== option.value) {
                    e.currentTarget.style.borderColor = option.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (recommendation !== option.value) {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>
            Additional Comments
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Provide detailed feedback about the candidate's performance..."
            rows={4}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-background)',
              fontSize: 'var(--font-size-base)',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} style={{ background: '#2297FA' }}>
            <FiSend style={{ marginRight: 8 }} /> Submit Feedback
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const RatingSection: React.FC<{
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}> = ({ label, description, value, onChange }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            {label}
          </label>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginTop: 2 }}>
            {description}
          </p>
        </div>
        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: '#2297FA' }}>
          {value}/5
        </span>
      </div>
      <StarRating value={value} onChange={onChange} />
    </div>
  );
};

export default FeedbackForm;
