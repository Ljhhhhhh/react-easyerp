import React, { useEffect, useState, useCallback } from 'react';
import { PageHeaderWrapper } from "@ant-design/pro-layout";
import { Dispatch } from "redux";
import { Button, Divider, Modal } from 'antd';
import SchemaForm, { Field, Submit, FormButtonGroup } from "@uform/antd";
// import { formatMessage } from "umi-plugin-react/locale";
import { connect } from "dva";
import StandardTable from '@/components/StandardTable';
import CreateCategory from './components/CreateCategory'
import { CategoryState } from './model';
// import { UserListItemParams } from './data';
import { ColumnProps } from 'antd/lib/table';

interface CategoryItemProps {
  createTime: number
  id: number
  name: string
  parentId: number
  sortOrder?: null
  status: boolean
  updateTime: number
}

interface TableListProps {
  dispatch: Dispatch<any>;
  category: CategoryState
}

const List = (props: TableListProps) => {
  const [selectedRows, SetRows] = useState([])
  const [modalShow, SetModalShow] = useState<boolean>(false)
  const [addModalShow, SetAddModalShow] = useState<boolean>(false)
  const [categoryPath, SetCategoryPath] = useState<any[]>([])
  const [selectedCategory, SetSelectedCategory] = useState<any>({})
  // const [selectedCategory, SetSelectedCategory] = useState<any>({})
  // const [originCategoryName, SetModalShow] = useState<boolean>(false)
  const { dispatch } = props;
  const category = props.category
  const { loading, ...datas } = category
  const data = {
    list: datas.list
  }

  useEffect(() => {
    const { dispatch } = props;
    dispatch({
      type: 'category/getList',
    })
  }, [])

  const setCategoryName = (item: CategoryItemProps) => {
    SetSelectedCategory(item)
    SetModalShow(true)
  }

  const cancelChange = () => {
    SetSelectedCategory({})
    SetModalShow(false)
  }

  const submitCategoryName = (values: any) => {
    const data = {
      ...values,
      categoryId: selectedCategory.id,
      parentCategoryId: categoryPath.length ? categoryPath[categoryPath.length - 1].id : undefined
    }
    const { dispatch } = props;
    dispatch({
      type: 'category/setCategoryName',
      payload: data
    })
    cancelChange()
  }

  const columns: ColumnProps<any>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '品类名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '操作',
      dataIndex: '',
      key: 'x',
      render: (item: any) => {
        return (
          <>
            <Button size="small" type="primary" onClick={() => setCategoryName(item)} >修改名称</Button>
            <Divider type="vertical" />
            <Button size="small" type="ghost" onClick={() => findChild(true, item)} >查看子类目</Button>
          </>
        )
      }
    }
  ];

  const handleSelectRows = (rows: any) => {
    SetRows(rows)
  };

  const handleStandardTableChange = (pagination: any) => {
    dispatch({
      type: 'category/getList',
      payload: pagination
    });
  };

  const handleAddModalVisible = useCallback((flag: boolean) => {
    SetAddModalShow(flag)
  }, [])

  const findChild = useCallback((goChild: boolean, item?: CategoryItemProps) => {
    const curId = item && item.id ? item.id : 0
    if (goChild) {
      const path = [...categoryPath, item];
      SetCategoryPath(path)
    } else {
      if (!item) {
        SetCategoryPath([])
      } else {
        let index = -1;
        categoryPath.forEach((cate, i) => {
          if (cate.id === item.id) {
            index = i + 1
          }
        })
        const path = [...categoryPath];
        path.splice(index, 1)
        SetCategoryPath(path)
      }
    }
    dispatch({
      type: 'category/getList',
      payload: curId
    })
  }, [categoryPath])

  const CategoryPathRender = (path: any[]) => {
    if (!path.length) return;
    return path.map((category, index) => {
      if (index === categoryPath.length - 1) {
        return (
          <React.Fragment key={category.id}>
            <span>/</span>
            <Button disabled={true} key={category.id} type="link" size="small">{category.name}</Button>
          </React.Fragment>
        )
      }
      return (
        <React.Fragment key={category.id}>
          <span>/</span>
          <Button key={category.id} type="link" size="small" onClick={() => findChild(false, category)} >{category.name}</Button>
        </React.Fragment>
      )
    })
  }
  
  return (
    <PageHeaderWrapper>
      <Button style={{ marginBottom: 15 }} icon="plus" type="primary" onClick={() => handleAddModalVisible(true)}>
        新建
      </Button>
      <div>
        <Button disabled={!categoryPath.length} type="link" onClick={() => findChild(false)}>全部</Button>
        {
          CategoryPathRender(categoryPath)
        }
      </div>

      <StandardTable
        data={data}
        pagination={false}
        rowKey="id"
        selectedRows={selectedRows}
        onSelectRow={handleSelectRows}
        columns={columns}
        loading={loading}
        onChange={handleStandardTableChange}
      />
      <ChangeCategoryNameModal
        submit={(v: any) => submitCategoryName(v)}
        visible={modalShow}
        cancelChange={() => cancelChange()}
        originName={selectedCategory.name}
      />
      <CreateCategory 
        toggleCreate={() => SetAddModalShow} 
        createCategoryShow={addModalShow} 
        categoryList={data.list} 
        categoryPath={categoryPath}
      />
    </PageHeaderWrapper>
  )
}

interface ModalParams {
  visible: boolean
  originName?: string
  submit: (v: any) => void
  cancelChange: () => void
}

const ChangeCategoryNameModal = (props: ModalParams) => {
  const { visible, submit, cancelChange, originName } = props
  const defaultValue = {
    categoryName: originName
  }
  if (visible) return (
    <Modal
      title="修改分类名称"
      visible={visible}
      footer={null}
      onCancel={cancelChange}
    >
      <SchemaForm layout="vertical" onSubmit={submit} defaultValue={defaultValue}>
        <Field
          type="string"
          required
          name="categoryName"
        />
        <FormButtonGroup>
          <Submit />
          <Button onClick={cancelChange}>取消</Button>
        </FormButtonGroup>
      </SchemaForm>
    </Modal>
  );
  return null
}

export default connect(
  ({
    category
  }: {
    category: CategoryItemProps;
  }) => ({
    category
  })
)(List);