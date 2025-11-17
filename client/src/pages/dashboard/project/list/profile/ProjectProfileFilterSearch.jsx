import { useState, useEffect } from 'react';
import { ListFilter, UserRoundCheck, UserRoundMinus, UserRoundX, Users } from 'lucide-react';
import { ButtonGhost } from '@/components/Button';
import { Color, StatusCommon } from '@/enums/enum';
import useDebounce from '@/hooks/useDebounce';
import { TabsUi, TabsUi1 } from '@/components/TabsUi';
import InputUi from '@/components/InputUi';
import { convertStatusCommonEnumToText } from '@/utils/convertUtil';
import { formatNumberVN } from '@/utils/commonUtil';

export default function ProjectProfileFilterSearch({
  selectedTab,
  onChangeSelectedTab = () => { },

  selectedStatusTab,
  onChangeSelectedStatusTab = () => { },

  onClearAllSelectedItems = () => { },

  onChangeSearch = () => { },

  search,
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

  const tabs = [
    {
      name: `Đã tham gia`,
      value: 'joined',
      icon: <Users size={17} />,
      total: (pagination?.totalItemsUnActive + pagination?.totalItemsActive) || 0,
    },
    {
      name: `Chưa tham gia`,
      value: "free",
      total: pagination?.totalItemsFree || 0,
      icon: <UserRoundMinus size={17} />,
    },
  ];

  const statusTabs = [
    {
      name: convertStatusCommonEnumToText(StatusCommon.IN_ACTIVE),
      value: StatusCommon.IN_ACTIVE,
      total: pagination?.totalItemsActive || 0,
      icon: <UserRoundCheck size={17} />
    },
    {
      name: convertStatusCommonEnumToText(StatusCommon.UN_ACTIVE),
      value: StatusCommon.UN_ACTIVE,
      total: pagination?.totalItemsUnActive || 0,
      icon: <UserRoundX size={17} />,
    },
  ];

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
            className='
                items-center border-none inline-flex select-none gap-0 h-40 bg-color-light pdi-15 border-primary-2
                '
          >
            <div className='fs-13 fw-500 flex gap-6'>
              <Users size={17} />
              {`${formatNumberVN(100000)} Points`}
            </div>
          </div>
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
        <div className='d-flex items-center gap-10'>
          {action}
        </div>
      </div>
      {!pagination?.isTabFree &&
        <div className="d-flex justify-content-between align-items-center gap-20 mt-0.5">
          <div className="filter-search d-flex gap-10 items-center">
            <TabsUi1
              tabs={statusTabs}
              selectedTab={selectedStatusTab}
              onChangeTab={(value) => onChangeSelectedStatusTab(value)}
            />
          </div>
        </div>
      }
    </>
  )
}
