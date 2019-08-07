import { AnyAction, Reducer } from "redux";
import { fetchCategory, changeCategoryName, createCreategory } from "@/services/product";
import { EffectsCommandMap } from "dva";
import { message } from 'antd'

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: {}) => T) => T }
) => void;

export interface UserModelState {
  [key: string]: string | number;
}

export interface CategoryState {
  list: any[],
  loading: boolean
}

export interface ModelType {
  namespace: string;
  state: CategoryState;
  effects: {
    getList: Effect;
    setCategoryName: Effect;
    createCategory: Effect;
  };
  reducers: {
    setList: Reducer<{}>;
    setLoading: Reducer<{}>;
  };
}

const Model: ModelType = {
  namespace: "category",

  state: {
    list: [],
    loading: false
  },

  effects: {
    *getList({ payload }, { call, put }) {
      yield put({type: "setLoading"});
      const response = yield call(fetchCategory, payload)
      if (response.status === 0) {
        yield put({
          type: "setList",
          payload: response.data
        });
      }
    },
    
    *setCategoryName({ payload }, { call, put}) {
      const { parentCategoryId, ...data } = payload
      const response = yield call(changeCategoryName, data)
      if ( response.status === 0 ) {
        message.success(response.data || '更新品类名字成功')
        yield put({
          type: 'getList',
          payload: parentCategoryId
        })
      }
    },

    *createCategory({ payload }, { call, put }) {
      const { parentCategoryId, ...data } = payload
      const response = yield call(createCreategory, data)
      if ( response.status === 0 ) {
        message.success(response.data || '新增品类成功')
        yield put({
          type: 'getList',
          payload: parentCategoryId
        })
      }
    }
  },

  reducers: {
    setList(state, { payload }) {
      const list = payload.splice(0, 100)
      return {
        loading: false,
        list
      };
    },
    setLoading(state) {
      return {
        ...state,
        loading: true
      }
    }
  }
};

export default Model;
