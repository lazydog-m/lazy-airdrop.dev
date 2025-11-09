import React, { useState, useEffect, useCallback } from 'react';
import { ButtonPrimary } from "@/components/Button";
import Container from "@/components/Container";
import { HeaderAction } from "@/components/HeaderSection";
import Page from "@/components/Page";
import { FilePlus, } from 'lucide-react';
import { apiGet } from '@/utils/axios';
import useSpinner from '@/hooks/useSpinner';
import ScriptDataTable from './ScriptDataTable.jsx';
import ScriptFilterSearch from './ScriptFilterSearch.jsx';
import useMessage from '@/hooks/useMessage';
import useTable from '@/hooks/useTable';
import { delayApi } from '@/utils/commonUtil';
import { Link } from 'react-router-dom';
import { PATH_DASHBOARD } from '@/routes/path.js';
import { StatusCommon } from '@/enums/enum.js';

const ScriptDataTableMemo = React.memo(ScriptDataTable);

export default function ScriptList() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const { onOpen, onClose } = useSpinner();
  const { onError } = useMessage();

  const [selectedStatusItems, setSelectedStatusItems] = useState([StatusCommon.IN_ACTIVE]);
  const [search, setSearch] = useState('');

  const {
    onSelectRow,
    selected,
    setSelected,
    onSelectAllRows,
    page,
    onChangePage,
  } = useTable({});

  const fetchApi = async (dataTrigger = false, onTrigger = () => { }) => {
    const params = {
      selectedStatusItems,
      page,
      search,
    }

    try {
      if (!dataTrigger) {
        onOpen();
      }

      const response = await apiGet("/scripts", params);

      if (dataTrigger) {
        delayApi(() => {
          setData(response.data.data.data || []);
          setPagination(response.data.data.pagination || {});
          onTrigger();
        })
      }
      else {
        delayApi(() => {
          setData(response.data.data.data || []);
          setPagination(response.data.data.pagination || {});
          onClose();
        })
      }
    } catch (error) {
      console.error(error);
      onError(error.message);
      onClose();
    }
  }

  const handleSelectAllRows = React.useCallback((checked) => {
    const selecteds = data.map((row) => row.id);
    onSelectAllRows(checked, selecteds);
  }, [data])

  const handleSelectRow = React.useCallback((id) => {
    onSelectRow(id);
  }, [selected])

  const handleUpdateData = useCallback((onTrigger = () => { }) => {
    fetchApi(true, onTrigger)
  }, [search, page, selectedStatusItems]);

  const handleDeleteData = useCallback((id, onTrigger = () => { }) => {
    fetchApi(true, () => {
      const newSelected = selected.filter(selected => selected !== id);
      setSelected(newSelected);
      onTrigger();
    })
  }, [search, page, selectedStatusItems, selected]);

  const handleChangeSearch = (value) => {
    setSearch(value);
    onChangePage(1);
  }

  const handleChangeSelectedStatusItems = (label, isChecked) => {
    setSelectedStatusItems((prev) => {
      if (isChecked) {
        return [...prev, label];
      } else {
        return prev.filter((item) => item !== label);
      }
    });
    onChangePage(1);
  };

  const handleClearAllSelectedItems = () => {
    setSelectedStatusItems([]);
    setSearch('');
    onChangePage(1);
  }

  const handleChangePage = useCallback((newPage) => {
    onChangePage(newPage)
  }, [])

  useEffect(() => {
    fetchApi();
  }, [selectedStatusItems, search, page])

  return (
    <Page title='Scripts'>
      <Container>

        <HeaderAction
          heading='Danh sách scripts'
          action={
            <Link to={PATH_DASHBOARD.script.create}>
              <ButtonPrimary
                icon={<FilePlus />}
                title='Tạo script'
              />
            </Link>
          }
        />

        <ScriptFilterSearch
          selectedStatusItems={selectedStatusItems}
          onChangeSelectedStatusItems={handleChangeSelectedStatusItems}
          onClearSelectedStatusItems={() => setSelectedStatusItems([])}
          onClearAllSelectedItems={handleClearAllSelectedItems}
          onChangeSearch={handleChangeSearch}
          search={search}
        />

        <ScriptDataTableMemo
          pagination={pagination}
          onChangePage={handleChangePage}
          data={data}
          selected={selected}
          onSelectAllRows={handleSelectAllRows}
          onSelectRow={handleSelectRow}
          onUpdateData={handleUpdateData}
          onDeleteData={handleDeleteData}
        />

      </Container>
    </Page>
  )
}
