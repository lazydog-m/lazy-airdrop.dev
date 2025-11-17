import { useState, useEffect } from 'react';
import { Calendar1, CalendarClock, CalendarMinus, CalendarMinus2, CircleUserRound, ClipboardCheck, ClipboardMinus, ClipboardX, Globe, Goal, List, ListFilter, Twitter, UserRoundPlus } from 'lucide-react';
import { ButtonGhost } from '@/components/Button';
import { Color, StatusCommon, TaskType } from '@/enums/enum';
import useDebounce from '@/hooks/useDebounce';
import { TabsUi1, TabsUi } from '@/components/TabsUi';
import { convertProjectTaskTypeEnumToText, convertStatusCommonEnumToText, darkenColor, lightenColor } from '@/utils/convertUtil';
import InputUi from '@/components/InputUi';

export default function ProjectTaskFilterSearch({
  selectedStatusTab,
  onChangeSelectedStatusTab = () => { },

  selectedTaskTab,
  onChangeSelectedTaskTab = () => { },

  onClearAllSelectedItems = () => { },

  onChangeSearch = () => { },

  action = {},
  pagination = {},
}) {

  const [filterSearch, setFilterSearch] = useState('');

  const debounceValue = useDebounce(filterSearch, 500);

  useEffect(() => {
    onChangeSearch(debounceValue);
  }, [debounceValue]);

  const clearAll = () => {
    onClearAllSelectedItems();
    setFilterSearch('');
  }

  const IS_REG_LOGIN = pagination?.type === TaskType.REG || pagination?.type === TaskType.LOGIN;

  const statusTabs = [
    {
      name: 'Tất cả',
      value: 'all',
      total: pagination?.totalItemsFree || 0,
      icon: <List size={17} />
    },
    {
      name: convertStatusCommonEnumToText(StatusCommon.IN_COMPLETE),
      value: StatusCommon.IN_COMPLETE,
      total: pagination?.totalItemsFree || 0,
      icon: <ClipboardMinus size={17} />
    },
    {
      name: convertStatusCommonEnumToText(StatusCommon.COMPLETED),
      value: StatusCommon.COMPLETED,
      total: pagination?.totalItemsFree || 0,
      icon: <ClipboardCheck size={17} />
    },
    {
      name: convertStatusCommonEnumToText(StatusCommon.UN_ACTIVE),
      value: StatusCommon.UN_ACTIVE,
      total: pagination?.totalItemsFree || 0,
      icon: <ClipboardX size={17} />
    },
  ];

  const getTotalByType = (type) => {
    const total = pagination?.totalCountType?.find(item => item?.type === type)?.total;
    return total || 0;
  }

  const taskTabs = [
    {
      name: convertProjectTaskTypeEnumToText(TaskType.REG),
      value: TaskType.REG,
      // notCount: true,
      total: pagination?.totalItemsFree || 0,
      icon: <UserRoundPlus size={17.5} />,
    },
    {
      name: convertProjectTaskTypeEnumToText(TaskType.LOGIN),
      value: TaskType.LOGIN,
      notCount: true,
      icon: <CircleUserRound size={17.5} />,
    },
    {
      name: convertProjectTaskTypeEnumToText(TaskType.DAILY),
      value: TaskType.DAILY,
      notCount: true,
      icon: <CalendarClock size={17.5} />,
    },
    {
      name: convertProjectTaskTypeEnumToText(TaskType.POINTS),
      value: TaskType.POINTS,
      notCount: true,
      icon: <Twitter size={17.5} />,
    },
    {
      name: convertProjectTaskTypeEnumToText(TaskType.OFF_CHAIN),
      value: TaskType.OFF_CHAIN,
      notCount: true,
      icon: <Globe size={17.5} />,
    },
    {
      name: convertProjectTaskTypeEnumToText(TaskType.AIRDROP),
      value: TaskType.AIRDROP,
      notCount: true,
      icon: <Goal size={18} />,
    },
    // {
    //   name: 'Khác',
    //   value: 'other',
    //   total: getTotalByType(TaskType.AIRDROP),
    //   icon: <Goal size={18} className='mt-0' />,
    //   color: Color.ORANGE,
    // },
  ];

  useEffect(() => {
    if (!IS_REG_LOGIN) {
      onChangeSelectedStatusTab('all')
    }
  }, [pagination?.type])

  return (
    <>
      <div className="filter-search d-flex gap-10 items-center justify-between mt-2">
        <TabsUi
          tabs={taskTabs}
          selectedTab={selectedTaskTab}
          onChangeTab={(value) => {
            onChangeSelectedTaskTab(value);
            if (value !== TaskType.LOGIN || value !== TaskType.LOGIN) {
              onChangeSelectedStatusTab('all')
            }
          }
          }
        />
        <div className="filter-search d-flex gap-10 items-center">
          {action}
        </div>
      </div>
      {!IS_REG_LOGIN &&
        <div className="d-flex justify-content-between align-items-center gap-20 mt-0.5">
          <div className="filter-search d-flex gap-10 items-center">
            <TabsUi1
              tabs={statusTabs}
              selectedTab={selectedStatusTab}
              onChangeTab={(value) => onChangeSelectedStatusTab(value)}
            />
            <InputUi
              placeholder='Tìm kiếm task ...'
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
      }
    </>
  )
}

