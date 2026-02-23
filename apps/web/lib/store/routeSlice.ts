import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchRoutesAction,
  updateRoutesStatusAction,
} from "@/app/actions/routeActions";
import { Doc } from "@propure/convex/genereated";

// export interface Route {
//   id: string;
//   state: string;
//   suburb: string;
//   postcode: string;
//   status: "pending" | "done" | "failed";
// }

interface RouteState {
  routes: Doc<"scrapping_locations">[];
  selectedRows: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  updating: boolean;
  sortBy: "state" | "suburb" | "postcode" | null;
  sortOrder: "asc" | "desc";
  groupBy: "state" | "suburb" | "postcode" | null;
}

const initialState: RouteState = {
  routes: [],
  selectedRows: {},
  loading: false,
  error: null,
  updating: false,
  sortBy: null,
  sortOrder: "asc",
  groupBy: null,
};

// Async thunk for fetching routes
export const fetchRoutes = createAsyncThunk(
  "routes/fetchRoutes",
  async (_, { rejectWithValue }) => {
    try {
      const result = await fetchRoutesAction();
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch routes",
      );
    }
  },
);

// Async thunk for updating routes status
export const updateRoutesStatus = createAsyncThunk(
  "routes/updateRoutesStatus",
  async (
    {
      selectedIds,
      newStatus,
    }: {
      selectedIds: Doc<"scrapping_locations">[];
      newStatus: "pending" | "done" | "failed";
    },
    { rejectWithValue },
  ) => {
    try {
      const result = await updateRoutesStatusAction(selectedIds, newStatus);
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update routes",
      );
    }
  },
);

const routeSlice = createSlice({
  name: "routes",
  initialState,
  reducers: {
    toggleRowSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.selectedRows[id] = !state.selectedRows[id];
    },
    selectAllRows: (state) => {
      state.routes.forEach((route) => {
        state.selectedRows[route._id] = true;
      });
    },
    deselectAllRows: (state) => {
      state.selectedRows = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    setSortBy: (
      state,
      action: PayloadAction<"state" | "suburb" | "postcode" | null>,
    ) => {
      if (state.sortBy === action.payload) {
        // Toggle sort order if same column clicked
        state.sortOrder = state.sortOrder === "asc" ? "desc" : "asc";
      } else {
        // Set new sort column with ascending order
        state.sortBy = action.payload;
        state.sortOrder = "asc";
      }
    },
    setGroupBy: (
      state,
      action: PayloadAction<"state" | "suburb" | "postcode" | null>,
    ) => {
      state.groupBy = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch routes handlers
    builder
      .addCase(fetchRoutes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update routes handlers
    builder
      .addCase(updateRoutesStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateRoutesStatus.fulfilled, (state, action) => {
        state.updating = false;
        state.routes = action.payload;
        state.selectedRows = {};
      })
      .addCase(updateRoutesStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  toggleRowSelection,
  selectAllRows,
  deselectAllRows,
  clearError,
  setSortBy,
  setGroupBy,
} = routeSlice.actions;
export default routeSlice.reducer;