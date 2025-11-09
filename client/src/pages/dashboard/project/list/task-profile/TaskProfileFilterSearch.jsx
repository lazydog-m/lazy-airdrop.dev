import { useState, useEffect } from 'react';
import { Chrome, Grip, ListFilter, UserLock, UserRoundCheck, UserRoundMinus, UserRoundSearch, UserRoundX, Users, Play, Cog, LockIcon, EyeIcon } from 'lucide-react';
import { ButtonGhost, ButtonInfo, ButtonOrange, ButtonOutline } from '@/components/Button';
import { Color, StatusCommon } from '@/enums/enum';
import useDebounce from '@/hooks/useDebounce';
import { TabsUi } from '@/components/TabsUi';
import TooltipUi from '@/components/TooltipUi';
import InputUi from '@/components/InputUi';
import { LiaUserLockSolid } from "react-icons/lia";
import { convertStatusCommonEnumToText } from '@/utils/convertUtil';
import { RiTodoLine } from 'react-icons/ri';
import useConfirm from '@/hooks/useConfirm';
import useSpinner from '@/hooks/useSpinner';
import useMessage from '@/hooks/useMessage';
import { apiGet } from '@/utils/axios';
import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button, Group, Input, Label, NumberField } from 'react-aria-components'

export default function TaskProfileFilterSearch({
  selectedTab,
  onChangeSelectedTab = () => { },

  onClearAllSelectedItems = () => { },

  onChangeSearch = () => { },
  search = '',
  taskUrl = '',

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

  const [filterTab, setFilterTab] = useState(selectedTab);

  const debounce = useDebounce(filterTab, 50);

  useEffect(() => {
    onChangeSelectedTab(debounce);
  }, [debounce]);

  const clearAll = () => {
    onClearAllSelectedItems();
    setFilterSearch('');
  }

  const tabs = [
    {
      name: 'Profiles',
      value: 'All',
      total: pagination?.totalItemsFree || 0,
      icon: <Users size={17} />
    },
    {
      name: 'Config',
      value: 'input',
      // total: pagination?.totalItemsFree || 0,
      icon: <Cog size={17} />
    },
    {
      name: 'Runs',
      value: 'runs',
      // total: pagination?.totalItemsFree || 0,
      icon: <Play size={17} />
    },
  ];

  // const tabs = [
  //   {
  //     name: convertStatusCommonEnumToText(StatusCommon.IN_COMPLETE),
  //     value: StatusCommon.IN_COMPLETE,
  //     total: pagination?.totalItemsFree || 0,
  //     icon: <UserRoundMinus size={17} />
  //   },
  //   {
  //     name: convertStatusCommonEnumToText(StatusCommon.COMPLETED),
  //     value: StatusCommon.COMPLETED,
  //     total: pagination?.totalItemsJoined || 0,
  //     icon: <UserRoundCheck size={17} />
  //   },
  // ];

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
            selectedTab={filterTab}
            onChangeTab={(value) => setFilterTab(value)}
          />
          <InputUi
            placeholder='Tìm kiếm profiles ...'
            style={{ width: '250px' }}
            className='custom-input'
            value={filterSearch}
            onChange={(event) => setFilterSearch(event.target.value)}
          />
          <NumberField defaultValue={1024} step={1000} minValue={0} className='w-full max-w-xs space-y-2'>
            <Group
              className='
            relative inline-flex h-40 w-full
            items-center overflow-hidden 
            bg-color-light text-base whitespace-nowrap 
            shadow-xs 
            data-disabled:pointer-events-none 
            data-disabled:cursor-not-allowed 
            data-disabled:opacity-50 
            transition-all duration-200 ease-in-out
            focus-within:outline-none
            focus-within:ring-offset-1 focus-within:ring-offset-background
            focus-within:ring-[1px]
            focus-within:ring-offset-neutral-500
            focus-within:ring-[#d4d4d4]
            '>
              <Input className='border-1
              custom-group-input
              w-full px-3 py-1.5 outline-none
              ' />
              <Button
                slot='decrement'
                className='
              !border-t-0
              !border-b-0
              button-outlined pointer items-center
              flex aspect-square h-[inherit]  transition-all duration-200 ease-in-out 
              justify-center disabled:pointer-events-none
              disabled:cursor-not-allowed disabled:opacity-50
              '
              >
                <MinusIcon className='size-4' />
                <span className='sr-only'>Decrement</span>
              </Button>
              <Button
                slot='increment'
                className='
              !border-0
              button-outlined pointer items-center
              flex aspect-square h-[inherit]  transition-all duration-200 ease-in-out 
              justify-center disabled:pointer-events-none
              disabled:cursor-not-allowed disabled:opacity-50
              '
              >
                <PlusIcon className='size-4' />
                <span className='sr-only'>Increment</span>
              </Button>
            </Group>
          </NumberField>
          {filterSearch &&
            <ButtonGhost
              icon={<ListFilter color={Color.ORANGE} />}
              onClick={clearAll}
            />
          }
        </div>

        <div className='d-flex items-center gap-10'>
          <div
            className='me-0
                items-center border-none inline-flex select-none gap-0 h-40 bg-color-light pdi-15 border-primary-2
                '
          >
            <div className='fs-13 fw-500 flex gap-1'>
              <span className='flex gap-6'>
                <Users size={17} />
                {`100`}
              </span>
              {` - 100,000 Points`}
            </div>
          </div>
          {action}

          {selected.length > 0 &&
            <>
              <ButtonInfo
                style={{
                  opacity: loadingIds.size > 0 ? '0.5' : '1',
                  pointerEvents: loadingIds.size > 0 ? 'none' : '',
                }}
                onClick={handleOpenProfiles}
                icon={<Chrome />}
                title={'Open'}
              />

              <ButtonOrange
                style={{
                  opacity: loadingIds.size > 0 ? '0.5' : '1',
                  pointerEvents: loadingIds.size > 0 ? 'none' : '',
                }}
                onClick={handleCloseProfiles}
                icon={<Chrome />}
                title={'Close'}
              />
              {openningIds.size > 0 &&
                <ButtonOutline
                  style={{
                    opacity: loadingIds.size > 0 ? '0.5' : '1',
                    pointerEvents: loadingIds.size > 0 ? 'none' : '',
                  }}
                  onClick={handleSortProfileLayout}
                  icon={<Grip />}
                  title={'Sắp xếp'}
                />
              }
            </>
          }
        </div>

      </div>

    </>
  )
}
