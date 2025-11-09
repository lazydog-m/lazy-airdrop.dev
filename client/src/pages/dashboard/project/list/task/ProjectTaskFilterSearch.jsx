import { useState, useEffect } from 'react';
import { Award, BadgeCheck, CalendarClock, CalendarDays, CircleUserRound, ClipboardCheck, ClipboardMinus, ClipboardX, Flame, Gift, Gitlab, Globe, Goal, LandPlot, ListFilter, Medal, Rocket, Trophy, Twitter, UserRound, UserRoundPlus } from 'lucide-react';
import { ButtonGhost } from '@/components/Button';
import { Color, StatusCommon, TaskType } from '@/enums/enum';
import useDebounce from '@/hooks/useDebounce';
import { TabsUi1, TabsUi } from '@/components/TabsUi';
import { convertProjectTaskTypeEnumToText, convertStatusCommonEnumToText, darkenColor, lightenColor } from '@/utils/convertUtil';
import InputUi from '@/components/InputUi';
import { SiChainguard } from "react-icons/si";

export default function ProjectTaskFilterSearch({
  selectedStatusTab,
  onChangeSelectedStatusTab = () => { },

  selectedTaskTab,
  onChangeSelectedTaskTab = () => { },

  onClearAllSelectedItems = () => { },

  onChangeSearch = () => { },
  search = '',

  action = {},
  pagination = {},
}) {

  const [filterSearch, setFilterSearch] = useState('');

  const debounceValue = useDebounce(filterSearch, 500);

  useEffect(() => {
    onChangeSearch(debounceValue);
  }, [debounceValue]);

  const [filterStatusTab, setFilterStatusTab] = useState(selectedStatusTab);
  const [filterTaskTab, setFilterTaskTab] = useState(selectedTaskTab);

  const debounceStatusTab = useDebounce(filterStatusTab, 50);
  const debounceTaskTab = useDebounce(filterTaskTab, 50);

  useEffect(() => {
    onChangeSelectedTaskTab(debounceTaskTab);
  }, [debounceTaskTab]);

  useEffect(() => {
    onChangeSelectedStatusTab(debounceStatusTab);
  }, [debounceStatusTab]);

  const clearAll = () => {
    onClearAllSelectedItems();
    setFilterSearch('');
  }

  const IS_REG_LOGIN = pagination?.type === TaskType.REG || pagination?.type === TaskType.LOGIN;

  const statusTabs = [
    {
      name: convertStatusCommonEnumToText(StatusCommon.IN_COMPLETE),
      value: StatusCommon.IN_COMPLETE,
      // total: pagination?.totalItemsFree || 0,
      icon: <ClipboardMinus size={17} />
    },
    {
      name: convertStatusCommonEnumToText(StatusCommon.COMPLETED),
      value: StatusCommon.COMPLETED,
      // total: pagination?.totalItemsFree || 0,
      icon: <ClipboardCheck size={17} />
    },
    {
      name: convertStatusCommonEnumToText(StatusCommon.UN_ACTIVE),
      value: StatusCommon.UN_ACTIVE,
      // total: pagination?.totalItemsFree || 0,
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
      total: getTotalByType(TaskType.REG),
      icon: <UserRoundPlus size={17.5} className='mt-0' />
    },
    {
      name: convertProjectTaskTypeEnumToText(TaskType.LOGIN),
      value: TaskType.LOGIN,
      total: getTotalByType(TaskType.LOGIN),
      icon: <CircleUserRound size={17.5} className='mt-0' />
    },
    {
      name: convertProjectTaskTypeEnumToText(TaskType.DAILY),
      value: TaskType.DAILY,
      total: getTotalByType(TaskType.DAILY),
      icon: <CalendarClock size={17.5} className='mt-0' />
    },
    {
      name: convertProjectTaskTypeEnumToText(TaskType.POINTS),
      value: TaskType.POINTS,
      total: getTotalByType(TaskType.POINTS),
      icon: <Twitter size={17.5} className='mt-0' />
    },
    {
      name: convertProjectTaskTypeEnumToText(TaskType.OFF_CHAIN),
      value: TaskType.OFF_CHAIN,
      total: getTotalByType(TaskType.OFF_CHAIN),
      icon: <Globe size={17.5} className='mt-0' />
    },
    {
      name: convertProjectTaskTypeEnumToText(TaskType.AIRDROP),
      value: TaskType.AIRDROP,
      total: getTotalByType(TaskType.AIRDROP),
      icon: <Goal size={18} className='mt-0' />
    },
  ];


  return (
    <>
      <div className="filter-search d-flex gap-10 items-center justify-between mt-2">
        <TabsUi
          tabs={taskTabs}
          selectedTab={filterTaskTab}
          onChangeTab={(value) => setFilterTaskTab(value)}
        />
        <div className="filter-search d-flex gap-10 items-center">
          {filterSearch &&
            <ButtonGhost
              icon={<ListFilter color={Color.ORANGE} />}
              onClick={clearAll}
            />
          }
          <InputUi
            placeholder='Tìm kiếm task ...'
            style={{ width: '250px' }}
            className='custom-input'
            value={filterSearch}
            onChange={(event) => setFilterSearch(event.target.value)}
          />
          {action}
        </div>
      </div>
      {!IS_REG_LOGIN &&
        <div className="d-flex justify-content-between align-items-center gap-20 mt-0.5">
          <div className="filter-search d-flex gap-10 items-center">
            <TabsUi1
              tabs={statusTabs}
              selectedTab={filterStatusTab}
              onChangeTab={(value) => setFilterStatusTab(value)}
            />
          </div>
        </div>
      }
    </>
  )
}

