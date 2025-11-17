import { useState, useEffect } from 'react';
import { Chrome, Grip, ListFilter, UserLock, UserRoundCheck, UserRoundMinus, UserRoundSearch, UserRoundX, Users, Play, Cog, LockIcon, EyeIcon, PlayCircle, List, FileCog, FileCog2, Settings, SquareMousePointer, Logs } from 'lucide-react';
import { ButtonGhost, ButtonInfo, ButtonOrange, ButtonOutline, ButtonOutlineInfo, ButtonOutlinePrimary } from '@/components/Button';
import { Color, StatusCommon } from '@/enums/enum';
import useDebounce from '@/hooks/useDebounce';
import { TabsUi, TabsUi1 } from '@/components/TabsUi';
import InputUi from '@/components/InputUi';
import { convertStatusCommonEnumToText } from '@/utils/convertUtil';
import useConfirm from '@/hooks/useConfirm';
import useSpinner from '@/hooks/useSpinner';
import useMessage from '@/hooks/useMessage';
import { apiGet } from '@/utils/axios';
import { formatNumberVN } from '@/utils/commonUtil';

export default function TaskProfileFilterSearch({
  selectedTab,
  onChangeSelectedTab = () => { },

  selectedStatusTab,
  onChangeSelectedStatusTab = () => { },

  onClearAllSelectedItems = () => { },

  onChangeSearch = () => { },
  taskUrl = '',
  projectId = '',

  action = {},
  pagination = {},
  selected = [],

  onAddOpenningIds,
  onRemoveOpenningIds,

  loadingIds = new Set(),
  openningIds = new Set(),
}) {

  const { onOpen, onClose } = useSpinner();
  const { onSuccess, onError } = useMessage();
  const { showLoading, swalClose } = useConfirm();
  const [filterSearch, setFilterSearch] = useState('');

  const debounceValue = useDebounce(filterSearch, 500);

  useEffect(() => {
    onChangeSearch(debounceValue);
  }, [debounceValue]);

  // const [filterTab, setFilterTab] = useState(selectedTab);
  // const [filterStatusTab, setFilterStatusTab] = useState(selectedStatusTab);
  //
  // const debounce = useDebounce(filterTab, 50);
  // const debounceStatusTab = useDebounce(filterStatusTab, 50);

  // useEffect(() => {
  //   onChangeSelectedTab(debounce);
  // }, [debounce]);
  //
  // useEffect(() => {
  //   onChangeSelectedStatusTab(debounceStatusTab);
  // }, [debounceStatusTab]);

  const clearAll = () => {
    onClearAllSelectedItems();
    setFilterSearch('');
  }

  const tabs = [
    {
      name: 'Manual',
      value: 'manual',
      notCount: true,
      icon: <SquareMousePointer size={17} />
    },
    {
      name: 'Automation',
      value: 'auto',
      notCount: true,
      icon: <Play size={17} />
    },
  ];

  const statusTabs = [
    {
      name: 'Tất cả',
      value: 'all',
      total: pagination?.totalItemsFree || 0,
      icon: <List size={17} />,
    },
    {
      name: convertStatusCommonEnumToText(StatusCommon.IN_COMPLETE),
      value: StatusCommon.IN_COMPLETE,
      total: pagination?.totalItemsFree || 10,
      icon: <UserRoundMinus size={17} />
    },
    {
      name: convertStatusCommonEnumToText(StatusCommon.COMPLETED),
      value: StatusCommon.COMPLETED,
      total: pagination?.totalItemsFree || 0,
      icon: <UserRoundCheck size={17} />
    },
  ];
  const runTaskProfiles = async () => {
    const params = {
      projectId,
    }

    try {
      // showLoading('Đang mở profiles ...');
      const response = await apiGet(`/task-profiles/${projectId}/run`, params);
      // const ids = response.data.data;
      // onAddOpenningIds(ids);
      // swalClose();
    } catch (error) {
      console.error(error);
      onError(error.message);
      // swalClose();
    }
  }

  const openProfiles = async () => {
    const params = {
      ids: selected,
      url: taskUrl || ''
    }

    try {
      showLoading('Đang mở profiles ...');
      const response = await apiGet("/profiles/open-multiple", params);
      const ids = response.data.data;
      onAddOpenningIds(ids);
      swalClose();
    } catch (error) {
      console.error(error);
      onError(error.message);
      swalClose();
    }
  }

  const closeProfiles = async () => {
    const params = {
      ids: selected,
    }

    try {
      showLoading('Đang đóng profiles ...');
      const response = await apiGet("/profiles/close-multiple", params);
      const ids = response.data.data;
      onRemoveOpenningIds(ids);
      swalClose();
    } catch (error) {
      console.error(error);
      onError(error.message);
      swalClose();
    }
  }

  const sortProfileLayouts = async () => {
    const params = {
      // ids: selected,
    }

    try {
      onOpen();
      const response = await apiGet("/profiles/sort-layout", params);
      // const ids = response.data.data;
      // onRemoveOpenningIds(ids);
      onClose();
    } catch (error) {
      console.error(error);
      onError(error.message);
      onClose();
    }
  }

  const handleOpenProfiles = () => {
    if (selected.length > 0) {
      openProfiles();
    }
  }

  const handleCloseProfiles = () => {
    if (selected.length > 0) {
      closeProfiles();
    }
  }

  const handleSortProfileLayout = () => {
    if (openningIds.size > 0) {
      sortProfileLayouts();
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between items-center mt-2">
        <div className="d-flex gap-10 items-center">
          <TabsUi
            tabs={tabs}
            selectedTab={selectedTab}
            onChangeTab={(value) => onChangeSelectedTab(value)}
          />
          <div
            className='me-0
                items-center border-none inline-flex select-none gap-0 h-40 bg-color-light pdi-15 border-primary-2
                '
          >
            <div className='fs-13 fw-500 flex gap-6'>
              <Users size={17} />
              {`${formatNumberVN(100000)} Points`}
            </div>
          </div>
        </div>

        <div className='d-flex items-center gap-10'>
          <InputUi
            placeholder='Scale 1'
            style={{ width: '100px' }}
            className='custom-input'
            value={filterSearch}
            onChange={(event) => setFilterSearch(event.target.value)}
          />
          {/* {action} */}

          {pagination?.type === 'manual' ?
            <>
              <ButtonInfo
                style={{
                  opacity: (selected.length <= 0 || loadingIds.size > 0) ? '0.5' : '1',
                  pointerEvents: (selected.length <= 0 || loadingIds.size > 0) ? 'none' : '',
                }}
                onClick={handleOpenProfiles}
                icon={<Chrome />}
                title={'Open'}
              />

              <ButtonOrange
                style={{
                  opacity: (selected.length <= 0 || loadingIds.size > 0) ? '0.5' : '1',
                  pointerEvents: (selected.length <= 0 || loadingIds.size > 0) ? 'none' : '',
                }}
                onClick={handleCloseProfiles}
                icon={<Chrome />}
                title={'Close'}
              />
              <ButtonOutline
                style={{
                  opacity: (openningIds.size <= 0) ? '0.5' : '1',
                  pointerEvents: (openningIds.size <= 0) ? 'none' : '',
                }}
                onClick={handleSortProfileLayout}
                icon={<Grip />}
                title={'Sắp xếp'}
              />
            </>
            :
            <>
              <ButtonOutline
                // onClick={handleSortProfileLayout}
                icon={<Settings />}
                title={'Config'}
              />
              <ButtonOutline
                // onClick={handleSortProfileLayout}
                icon={<Logs />}
                title={'Logs'}
              />
              <ButtonInfo
                style={{
                  // opacity: (selected.length <= 0 || loadingIds.size > 0) ? '0.5' : '1',
                  // pointerEvents: (selected.length <= 0 || loadingIds.size > 0) ? 'none' : '',
                }}
                onClick={runTaskProfiles}
                icon={<PlayCircle />}
                title={'Run task'}
              />
            </>
          }
        </div>

      </div>
      <div className="d-flex justify-content-between align-items-center gap-20 mt-0.5">
        <div className="filter-search d-flex gap-10 items-center">
          <TabsUi1
            tabs={statusTabs}
            selectedTab={selectedStatusTab}
            onChangeTab={(value) => onChangeSelectedStatusTab(value)}
          />
          <InputUi
            placeholder='Tìm kiếm profiles ...'
            style={{ width: '250px' }}
            className='custom-input'
            value={filterSearch}
            onChange={(event) => setFilterSearch(event.target.value)}
          />
          {filterSearch &&
            <ButtonGhost
              icon={<ListFilter color={Color.ORANGE} />}
              onClick={clearAll}
            />
          }
        </div>
      </div>

    </>
  )
}
