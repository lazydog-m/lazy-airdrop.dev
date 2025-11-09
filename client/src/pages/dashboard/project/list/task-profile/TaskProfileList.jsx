import React, { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/Modal';
import { apiDelete, apiGet, apiPost } from '@/utils/axios';
import useSpinner from '@/hooks/useSpinner';
import useMessage from '@/hooks/useMessage';
import useTable from '@/hooks/useTable';
import { delayApi } from '@/utils/commonUtil';
import TaskProfileFilterSearch from './TaskProfileFilterSearch';
import TaskProfileDataTable from './TaskProfileDataTable';
import { ButtonDanger, ButtonInfo, ButtonOrange, ButtonOutlinePrimary, ButtonPrimary } from '@/components/Button';
import { Chrome, CirclePlay, ClipboardPlus, LogIn, LogOut, ThumbsDownIcon, ThumbsUpIcon, UserMinus, UserPlus, UserRoundMinus, UserRoundPlus } from 'lucide-react';
import { Color, StatusCommon } from '@/enums/enum';
import useConfirm from '@/hooks/useConfirm';
import { Button } from '@/components/ui/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group"
import useSocket from '@/hooks/useSocket';

const TaskProfileDataTableMemo = React.memo(TaskProfileDataTable);

export default function TaskProfileList({ projectId = '', projectName = '', task = {} }) {
  const [open, setOpen] = useState(false); // modal
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const { onOpen, onClose } = useSpinner();
  const { showLoading, swalClose } = useConfirm();
  const { onSuccess, onError } = useMessage();
  const [openningIds, setOpenningIds] = useState(new Set());
  const [loadingIds, setLoadingIds] = React.useState(new Set());
  const socket = useSocket();

  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState(StatusCommon.IN_COMPLETE);

  const {
    onSelectRow,
    selected,
    setSelected,
    onSelectAllRows,
    page,
    onChangePage,
  } = useTable({});

  const fetchApiByProject = async (dataTrigger = false, onTrigger = () => { }) => {
    const params = {
      page,
      search,
      selectedTab,
    }

    try {
      if (!dataTrigger) {
        onOpen();
      }

      const response = await apiGet(`/task-profiles/${projectId}`, params);
      console.log(response.data.data)

      if (dataTrigger) {
        delayApi(() => {
          setData(response.data.data.data || []);
          setPagination(response.data.data.pagination || {});
          setOpenningIds(new Set(response.data.data.browsers));
          onTrigger();
        })
      }
      else {
        delayApi(() => {
          setData(response.data.data.data || []);
          setPagination(response.data.data.pagination || {});
          setOpenningIds(new Set(response.data.data.browsers));
          onClose();
        })
      }

    } catch (error) {
      console.error(error);
      onError(error.message);
      onClose();
    }
  }

  const handleSelectAllData = React.useCallback(() => {

    const idsByProject = async () => {
      const params = {
        selectedTab,
      }

      try {
        onOpen();
        const response = await apiGet(`/project-profiles/ids/${project?.id}`, params);
        console.log(response.data.data)

        delayApi(() => {
          setSelected(response.data.data || []);
          onClose();
        })

      } catch (error) {
        console.error(error);
        onError(error.message);
        onClose();
      }
    }

    idsByProject();
  }, [selectedTab])

  const outProfiles = async () => {
    const params = {
      profile_ids: selected,
    }

    try {
      showLoading();
      const response = await apiDelete("/project-profiles/multiple", params);
      const data = response.data.data;
      fetchApiByProject(true, () => {
        const newSelected = selected.filter(id => !data?.includes(id));
        setSelected(newSelected);
        onSuccess(`Rời dự án thành công!`);
        swalClose();
      })
    } catch (error) {
      console.error(error);
      onError(error.message);
      swalClose();
    }
  }

  const handleClearAllData = React.useCallback(() => {
    setSelected([]);
  }, [])

  const handleSelectAllRows = React.useCallback((checked) => {
    const selecteds = data.map((row) => row.id);
    onSelectAllRows(checked, selecteds);
  }, [data])

  const handleSelectRow = React.useCallback((id) => {
    onSelectRow(id);
  }, [selected])

  const handleUpdateData = useCallback((id, onTrigger = () => { }) => {
    fetchApiByProject(true, () => {
      // const newSelected = selected.filter(selected => selected !== id);
      // setSelected(newSelected);
      onTrigger();
    })
  }, [
    search,
    page,
    selectedTab,
    // selected,
  ]);

  const handleDeleteData = useCallback((id, onTrigger = () => { }) => {
    fetchApiByProject(true, () => {
      const newSelected = selected.filter(selected => selected !== id);
      setSelected(newSelected);
      onTrigger();
    })
  }, [
    search,
    page,
    selectedTab,
    selected,
  ]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangePage = useCallback((newPage) => {
    onChangePage(newPage)
  }, [])

  const handleChangeSearch = (value) => {
    setSearch(value);
    onChangePage(1);
  }

  const handleChangeSelectedTab = (selected) => {
    setSelectedTab(selected);
    onChangePage(1);
    setSelected([]);
  };

  const handleClearAllSelectedItems = () => {
    setSearch('');
    onChangePage(1);
  }

  const handleAddOpenningId = useCallback((id) => {
    setOpenningIds((prev) => new Set(prev).add(id));
  }, [])

  const handleAddOpenningIds = (ids = []) => {
    const updatedOpenningIds = new Set([...openningIds, ...ids]);
    setOpenningIds(updatedOpenningIds);
  };

  console.log(loadingIds)

  const handleRemoveOpenningIds = (ids = []) => {
    const updatedOpenningIds = new Set(openningIds);
    ids?.forEach((id) => {
      updatedOpenningIds.delete(id);
    });
    setOpenningIds(updatedOpenningIds);
  };

  const handleRemoveOpenningId = useCallback((id) => {
    setOpenningIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, [])

  const handleAddLoadingId = useCallback((id) => {
    setLoadingIds((prev) => new Set(prev).add(id));
  }, [])

  const handleRemoveLoadingId = useCallback((id) => {
    setLoadingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, [])

  useEffect(() => {
    fetchApiByProject();
  }, [
    search,
    selectedTab,
    page,
  ])

  useEffect(() => {
    socket.on('profileIdClosed', (data) => {
      handleRemoveOpenningId(data.id);
      console.log(data.id)
    });

    return () => {
      socket.off('profileIdClosed');
    };
  }, [socket]);

  const [automation, setAutomation] = useState(task?.script_name ? true : false)

  return (
    <div className='overflow-hidden'>
      <TaskProfileFilterSearch
        action={
          <>
          </>
        }
        pagination={pagination || {}}
        projectName={projectName}

        onClearAllSelectedItems={handleClearAllSelectedItems}

        search={search}
        onChangeSearch={handleChangeSearch}

        onChangeSelectedTab={handleChangeSelectedTab}
        selectedTab={selectedTab}

        taskUrl={task?.url}

        selected={selected}

        onAddOpenningIds={handleAddOpenningIds}
        onRemoveOpenningIds={handleRemoveOpenningIds}

        loadingIds={loadingIds}
        openningIds={openningIds}
      />

      <TaskProfileDataTableMemo
        pagination={pagination}
        onChangePage={handleChangePage}

        data={data}
        onUpdateData={handleUpdateData}
        onDeleteData={handleDeleteData}

        taskId={task?.id}
        taskUrl={task?.url}
        // projectId={projectId}

        selected={selected}
        onSelectAllRows={handleSelectAllRows}
        onSelectRow={handleSelectRow}

        onSelectAllData={handleSelectAllData}
        onClearAllData={handleClearAllData}

        openningIds={openningIds}
        onAddOpenningId={handleAddOpenningId}
        onRemoveOpenningId={handleRemoveOpenningId}

        loadingIds={loadingIds}
        onAddLoadingId={handleAddLoadingId}
        onRemoveLoadingId={handleRemoveLoadingId}
      />
    </div>
  )
}
