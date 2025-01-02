import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isToday, isPast } from 'date-fns';
import axios from 'axios';
import { mockCommunications } from '../mocks/mockData';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create async thunk for fetching communications
export const fetchCommunications = createAsyncThunk(
  'communications/fetchCommunications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/communications`, {
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
        }
      });
      return response.data;
    } catch (error) {
      // Improved error handling
      if (error.response) {
        // Server responded with error
        return rejectWithValue(error.response.data.message || 'Server error');
      } else if (error.request) {
        // Request made but no response
        return rejectWithValue('No response from server');
      } else {
        // Other errors
        return rejectWithValue('Failed to fetch communications');
      }
    }
  }
);

const communicationsSlice = createSlice({
  name: 'communications',
  initialState: {
    overdueCommunications: [],
    todayCommunications: [],
    allCommunications: [],
    loading: false,
    error: null
  },
  reducers: {
    setCommunications(state, action) {
      state.allCommunications = action.payload;
      state.overdueCommunications = action.payload.filter(
        comm => isPast(new Date(comm.dueDate)) && !isToday(new Date(comm.dueDate))
      );
      state.todayCommunications = action.payload.filter(
        comm => isToday(new Date(comm.dueDate))
      );
    },
    communicationAdded(state, action) {
      state.allCommunications.push(action.payload);
      const comm = action.payload;
      const commDate = new Date(comm.dueDate);
      if (isPast(commDate) && !isToday(commDate)) {
        state.overdueCommunications.push(comm);
      } else if (isToday(commDate)) {
        state.todayCommunications.push(comm);
      }
    },
    communicationUpdated(state, action) {
      const index = state.allCommunications.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.allCommunications[index] = action.payload;
        state.overdueCommunications = state.allCommunications.filter(
          comm => isPast(new Date(comm.dueDate)) && !isToday(new Date(comm.dueDate))
        );
        state.todayCommunications = state.allCommunications.filter(
          comm => isToday(new Date(comm.dueDate))
        );
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunications.fulfilled, (state, action) => {
        state.loading = false;
        state.allCommunications = action.payload;
        state.overdueCommunications = action.payload.filter(
          comm => isPast(new Date(comm.dueDate)) && !isToday(new Date(comm.dueDate))
        );
        state.todayCommunications = action.payload.filter(
          comm => isToday(new Date(comm.dueDate))
        );
      })
      .addCase(fetchCommunications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch communications';
      });
  }
});

export const { setCommunications, communicationAdded, communicationUpdated } = communicationsSlice.actions;
export default communicationsSlice.reducer; 