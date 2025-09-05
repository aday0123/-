// FIX: Import `useState` from React to fix state-related errors, and changed the `types` import to a regular import to allow using the `QuizType` enum as a value.
import React, { useState, useEffect, useCallback } from 'react';
import { type QuizQuestion, type Quiz1Question, type Quiz2Question, QuizType, type TTSSettings, type ImageStyle, IMAGE_STYLES } from '../types';
import { generateImageForPrompt } from '../services/geminiService';

// --- Sound Effects ---
const CORRECT_SOUND_URL = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaW5nIENTUkFQXlBLU0Y4AAAAAA+VEN5TEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVZAmEDMuOTlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//g'
const INCORRECT_SOUND_URL = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaW5nIENTUkFQXlBLU0Y4AAAAAA+VEN5TEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-JAPVlA8AAAAAADSAAAAAP3///wADAAEAAAABDVV1Vaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq-J'

// --- Icons ---
const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.946 1.55l-.291.956a11.956 11.956 0 0 0-1.621 1.22l-.829-.429a1.94 1.94 0 0 0-2.227.428l-1.088 1.088a1.94 1.94 0 0 0-.428 2.227l.429.829a11.956 11.956 0 0 0-1.22 1.621l-.956.291a1.94 1.94 0 0 0-1.55 1.946v1.414c0 .917.663 1.699 1.55 1.946l.956.291a11.956 11.956 0 0 0 1.22 1.621l-.429.829a1.94 1.94 0 0 0 .428 2.227l1.088 1.088a1.94 1.94 0 0 0 2.227.428l.829-.429a11.956 11.956 0 0 0 1.621 1.22l.291.956a1.94 1.94 0 0 0 1.946 1.55h1.414c.917 0 1.699-.663 1.946-1.55l.291-.956a11.956 11.956 0 0 0 1.621-1.22l.829.429a1.94 1.94 0 0 0 2.227-.428l1.088-1.088a1.94 1.94 0 0 0 .428-2.227l-.429-.829a11.956 11.956 0 0 0 1.22-1.621l.956-.291a1.94 1.94 0 0 0 1.55-1.946v-1.414c0-.917-.663-1.699-1.55-1.946l-.956-.291a11.956 11.956 0 0 0-1.22-1.621l.429-.829a1.94 1.94 0 0 0-.428-2.227l-1.088-1.088a1.94 1.94 0 0 0-2.227-.428l-.829.429a11.956 11.956 0 0 0-1.621-1.22l-.291-.956A1.94 1.94 0 0 0 12.922 2.25h-1.844ZM12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" clipRule="evenodd" />
    </svg>
);


const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);

const RedrawIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.18-3.185m-3.18-5.484-3.182-3.182a8.25 8.25 0 0 0-11.664 0L2.985 9.348m9.008 0 3.182 3.182" />
  </svg>
);


const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.69Z" />
        <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V18a.75.75 0 0 1-.75.75h-2.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
    </svg>
);

const ExportIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625a1.875 1.875 0 0 0-1.875 1.875v17.25a1.875 1.875 0 0 0 1.875 1.875h12.75a1.875 1.875 0 0 0 1.875-1.875V10.5M8.25 6.75h.75v.75h-.75V6.75Z" />
    </svg>
);


// --- Spinner ---
export const Spinner: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-sky-600 mb-4"></div>
        <p className="text-xl font-semibold text-slate-700">{message}</p>
        <p className="text-slate-500 mt-2">請稍候...</p>
    </div>
);

// --- Modals ---
interface FeedbackModalProps {
  isCorrect: boolean;
  correctAnswer: string;
  onClose: () => void;
}
export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isCorrect, correctAnswer, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
    <div className="bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-sm w-full text-center transform transition-all duration-300 scale-100 opacity-100">
      <h2 className={`text-4xl font-bold mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
        {isCorrect ? '答對了！' : '答錯了'}
      </h2>
      {!isCorrect && (
        <p className="text-lg text-slate-700 mb-6">
          正確答案是：<span className="font-semibold text-sky-600">{correctAnswer}</span>
        </p>
      )}
      <button
        onClick={onClose}
        className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
      >
        確定
      </button>
    </div>
  </div>
);

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
  ttsSettings: TTSSettings;
  onTtsSettingsChange: (newSettings: TTSSettings) => void;
  imageStyle: ImageStyle;
  onImageStyleChange: (newStyle: ImageStyle) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, voices, ttsSettings, onTtsSettingsChange, imageStyle, onImageStyleChange }) => {
  if (!isOpen) return null;

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoice = voices.find(v => v.voiceURI === e.target.value) || null;
    onTtsSettingsChange({ ...ttsSettings, voice: selectedVoice });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <CloseIcon className="w-7 h-7" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-slate-800">設定</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="style-select" className="block text-sm font-medium text-slate-600 mb-2">圖片風格</label>
            <select
              id="style-select"
              value={imageStyle}
              onChange={(e) => onImageStyleChange(e.target.value as ImageStyle)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-slate-900"
            >
              {IMAGE_STYLES.map(style => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>
            
          <hr/>

          <h3 className="text-lg font-semibold text-slate-700 -mb-2">語音設定</h3>
          <div>
            <label htmlFor="voice-select" className="block text-sm font-medium text-slate-600 mb-2">選擇聲音</label>
            <select
              id="voice-select"
              value={ttsSettings.voice?.voiceURI || ''}
              onChange={handleVoiceChange}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-slate-900"
            >
              {voices.filter(v => v.lang.startsWith('zh')).map(voice => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rate-slider" className="block text-sm font-medium text-slate-600 mb-2">速度: {ttsSettings.rate.toFixed(1)}</label>
            <input
              id="rate-slider"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={ttsSettings.rate}
              onChange={(e) => onTtsSettingsChange({ ...ttsSettings, rate: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          <div>
            <label htmlFor="volume-slider" className="block text-sm font-medium text-slate-600 mb-2">音量: {Math.round(ttsSettings.volume * 100)}%</label>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={ttsSettings.volume}
              onChange={(e) => onTtsSettingsChange({ ...ttsSettings, volume: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const getCorrectAnswerHelper = (question: QuizQuestion, quizType: QuizType) => {
    if (quizType === QuizType.DEFINITION) {
        return (question as Quiz1Question).correctDefinition;
    }
    return (question as Quiz2Question).word;
};

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    questions: QuizQuestion[];
    quizType: QuizType;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, questions, quizType }) => {
    const [copied, setCopied] = useState(false);

    const formatQuizForExport = useCallback(() => {
        let content = "中文詞彙測驗\n====================\n\n";

        questions.forEach((q, index) => {
            content += `第 ${index + 1} 題：\n`;
            if (quizType === QuizType.DEFINITION) {
                const question = q as Quiz1Question;
                content += `詞彙：「${question.word}」\n請選擇正確的解釋：\n`;
            } else {
                const question = q as Quiz2Question;
                content += `句子：「${question.sentence}」\n請填入正確的詞彙：\n`;
            }

            q.options.forEach((opt, i) => {
                content += `  ${i + 1}. ${opt}\n`;
            });
            content += "\n";
        });

        content += "====================\n正確解答\n====================\n\n";

        questions.forEach((q, index) => {
            const correctAnswer = getCorrectAnswerHelper(q, quizType);
            content += `${index + 1}. ${correctAnswer}\n`;
        });

        return content;
    }, [questions, quizType]);
    
    const formattedContent = formatQuizForExport();

    const handleCopy = () => {
        navigator.clipboard.writeText(formattedContent).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <CloseIcon className="w-7 h-7" />
                </button>
                <h2 className="text-2xl font-bold mb-4 text-slate-800">匯出考卷</h2>
                <p className="text-slate-600 mb-4">您可以將下方的文字複製並貼到 Google 文件或其他文件中。</p>
                <textarea
                    readOnly
                    className="w-full h-64 p-3 border border-slate-300 rounded-lg bg-slate-50 font-mono text-sm"
                    value={formattedContent}
                />
                <button
                    onClick={handleCopy}
                    className="mt-4 w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-all"
                >
                    {copied ? '已複製！' : '複製到剪貼簿'}
                </button>
            </div>
        </div>
    );
};


// --- Screens ---

interface QuizScreenProps {
  questions: QuizQuestion[];
  quizType: QuizType;
  onQuizComplete: (incorrectQuestions: QuizQuestion[]) => void;
  speak: (text: string) => void;
  onExitQuiz: () => void;
  imageStyle: ImageStyle;
  apiKey: string;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ questions, quizType, onQuizComplete, speak, onExitQuiz, imageStyle, apiKey }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null);
  const [incorrectlyAnswered, setIncorrectlyAnswered] = useState<QuizQuestion[]>([]);
  
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const currentQuestion = questions[currentIndex];

  const fetchImage = useCallback(async () => {
    if (!currentQuestion) return;
    setIsImageLoading(true);
    setImageError(null);
    setCurrentImage(null);
    try {
        const prompt = quizType === QuizType.DEFINITION 
            ? (currentQuestion as Quiz1Question).word
            : (currentQuestion as Quiz2Question).sentence
                .replace(/____/g, (currentQuestion as Quiz2Question).word)
                .replace(/\s*（.*?）\s*|\s*\([^)]*\)\s*/g, '')
                .trim();

        const imageData = await generateImageForPrompt(prompt, imageStyle, apiKey);
        setCurrentImage(`data:image/jpeg;base64,${imageData}`);
    } catch (error) {
        console.error("Image generation failed:", error);
        setImageError("圖片生成失敗，請稍後再試。");
    } finally {
        setIsImageLoading(false);
    }
  }, [currentQuestion, imageStyle, quizType, apiKey]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  const handleSelectAnswer = (option: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(option);
    const correctAnswer = getCorrectAnswerHelper(currentQuestion, quizType);
    const isCorrect = option === correctAnswer;

    if (isCorrect) {
        new Audio(CORRECT_SOUND_URL).play();
    } else {
        new Audio(INCORRECT_SOUND_URL).play();
        setIncorrectlyAnswered(prev => [...prev, currentQuestion]);
    }
    
    setFeedback({ isCorrect, correctAnswer });
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setSelectedAnswer(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onQuizComplete(incorrectlyAnswered);
    }
  };

  const renderQuestion = () => {
    if (quizType === QuizType.DEFINITION) {
      const q = currentQuestion as Quiz1Question;
      const textToSpeak = q.word; // Simplified TTS
      return (
        <div className="flex items-center justify-center space-x-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 text-center">{q.word}</h2>
            <button onClick={() => speak(textToSpeak)} className="text-sky-500 hover:text-sky-700 transition-colors"><SpeakerIcon className="w-8 h-8 md:w-10 md:h-10" /></button>
        </div>
      );
    } else {
      const q = currentQuestion as Quiz2Question;
      const textToSpeak = q.sentence;
      return (
        <div className="flex items-center justify-center space-x-4">
            <h2 className="text-2xl md:text-3xl font-medium text-slate-700 text-center leading-relaxed">{q.sentence}</h2>
            <button onClick={() => speak(textToSpeak)} className="text-sky-500 hover:text-sky-700 transition-colors"><SpeakerIcon className="w-8 h-8 md:w-10 md:h-10" /></button>
        </div>
      );
    }
  };
  
  const getOptionButtonClass = (option: string) => {
    let base = "w-full text-left p-4 rounded-lg border-2 text-lg transition-all duration-200 flex items-center space-x-4";
    if (!selectedAnswer) {
      return `${base} bg-white border-slate-300 hover:border-sky-500 hover:bg-sky-50 cursor-pointer`;
    }
    
    const correctAnswer = getCorrectAnswerHelper(currentQuestion, quizType);
    if (option === correctAnswer) {
      return `${base} bg-green-100 border-green-500 text-green-800`;
    }
    if (option === selectedAnswer && option !== correctAnswer) {
      return `${base} bg-red-100 border-red-500 text-red-800`;
    }
    return `${base} bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="w-full flex justify-between items-center mb-6">
            <button onClick={onExitQuiz} className="text-slate-500 hover:text-sky-600 transition-colors flex items-center space-x-2 text-sm font-semibold z-10">
                <HomeIcon className="w-5 h-5" />
                <span>返回選單</span>
            </button>
            <button onClick={() => setIsExportModalOpen(true)} className="text-slate-500 hover:text-sky-600 transition-colors flex items-center space-x-2 text-sm font-semibold">
                <ExportIcon className="w-5 h-5" />
                <span>輸出考卷</span>
            </button>
        </div>
      
      {isExportModalOpen && <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} questions={questions} quizType={quizType} />}
      {feedback && <FeedbackModal isCorrect={feedback.isCorrect} correctAnswer={getCorrectAnswerHelper(currentQuestion, quizType)} onClose={handleNextQuestion} />}
      
      <div className="md:grid md:grid-cols-2 md:gap-12 items-start">
        {/* Left Column: Quiz */}
        <div>
            <div className="text-center mb-6">
                <p className="text-lg font-semibold text-sky-700">第 {currentIndex + 1} / {questions.length} 題</p>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                    <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 mb-8 min-h-[150px] flex items-center justify-center">
                {renderQuestion()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                <button key={index} onClick={() => handleSelectAnswer(option)} disabled={!!selectedAnswer} className={getOptionButtonClass(option)}>
                    <span className="flex-shrink-0 font-bold text-sky-700">{index + 1}.</span>
                    <span className="flex-grow">{option}</span>
                    <button onClick={(e) => { e.stopPropagation(); speak(option); }} className="text-slate-400 hover:text-sky-600 disabled:opacity-50" disabled={!!selectedAnswer}><SpeakerIcon className="w-6 h-6"/></button>
                </button>
                ))}
            </div>
        </div>

        {/* Right Column: Image */}
        <div className="mt-10 md:mt-0 flex flex-col items-center">
             <div className="w-full max-w-md">
                <h3 className="text-xl font-semibold text-center mb-4 text-slate-700">AI 智慧繪圖</h3>
                <div className="flex items-center gap-2">
                    <div className="flex-grow w-full aspect-square bg-slate-200 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg">
                        {isImageLoading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-600"></div>
                                <p className="mt-4 text-slate-600 font-medium">圖片生成中...</p>
                            </div>
                        )}
                        {imageError && !isImageLoading && (
                            <div className="text-center p-4">
                            <p className="text-red-500 font-semibold">{imageError}</p>
                            </div>
                        )}
                        {currentImage && !isImageLoading && (
                            <img src={currentImage} alt="AI 生成的圖片" className="w-full h-full object-cover"/>
                        )}
                        {!currentImage && !isImageLoading && !imageError && (
                            <div className="text-center p-4 text-slate-500">
                                <p>圖片即將顯示於此</p>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={fetchImage} 
                        disabled={isImageLoading}
                        aria-label="重繪圖片"
                        className="flex-shrink-0 bg-white text-slate-600 p-3 rounded-full shadow-md hover:shadow-lg hover:bg-slate-50 transition-all border border-slate-200 disabled:bg-slate-200 disabled:cursor-not-allowed"
                    >
                        <RedrawIcon className="w-6 h-6"/>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};


interface ResultsScreenProps {
  incorrectQuestions: QuizQuestion[];
  quizType: QuizType;
  onRetry: () => void;
  onExit: () => void;
}
export const ResultsScreen: React.FC<ResultsScreenProps> = ({ incorrectQuestions, quizType, onRetry, onExit }) => {
  const getCorrectAnswer = (question: QuizQuestion) => {
    if (quizType === QuizType.DEFINITION) {
      return (question as Quiz1Question).correctDefinition;
    }
    return (question as Quiz2Question).word;
  };
  
  const getQuestionTitle = (question: QuizQuestion) => {
     if (quizType === QuizType.DEFINITION) {
      return (question as Quiz1Question).word;
    }
    return (question as Quiz2Question).sentence;
  }
  
  if (incorrectQuestions.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-green-600 mb-4">恭喜！</h2>
        <p className="text-xl text-slate-700 mb-8">你已完成所有題目！</p>
        <button
          onClick={onExit}
          className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-all duration-300"
        >
          返回主選單
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">答錯的題目</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-4 mb-8">
        {incorrectQuestions.map((q, index) => (
          <div key={index} className="bg-slate-50 p-4 rounded-lg">
            <p className="font-semibold text-slate-700">{index + 1}. {getQuestionTitle(q)}</p>
            <p className="text-green-700 font-medium mt-1">正確答案：{getCorrectAnswer(q)}</p>
          </div>
        ))}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={onRetry}
          className="flex-1 bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-all"
        >
          繼續練習 ({incorrectQuestions.length}題)
        </button>
        <button
          onClick={onExit}
          className="flex-1 bg-slate-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all"
        >
          返回主選單
        </button>
      </div>
    </div>
  );
};