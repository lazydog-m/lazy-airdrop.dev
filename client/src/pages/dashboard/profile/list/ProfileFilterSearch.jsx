import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Chrome, CirclePause, CirclePlay, CirclePlus, Grip, ListFilter, Pause, Play } from 'lucide-react';
import Popover from "@/components/Popover";
import { ButtonGhost, ButtonInfo, ButtonOrange, ButtonOutline, ButtonOutlinePrimary, ButtonOutlineTags, ButtonPrimary } from '@/components/Button';
import { Color, StatusCommon } from '@/enums/enum';
import { Badge } from '@/components/ui/badge';
import useDebounce from '@/hooks/useDebounce';
import useSpinner from '@/hooks/useSpinner';
import { apiGet } from '@/utils/axios';
import useMessage from '@/hooks/useMessage';
import { convertResource, convertStatusCommonEnumToColorHex, convertStatusCommonEnumToText, darkenColor, lightenColor } from '@/utils/convertUtil';
import { DropdownCheckboxMenu } from '@/components/Checkbox';
import { RESOURCES } from '@/commons/Resources';
import InputUi from '@/components/InputUi';
import useConfirm from '@/hooks/useConfirm';

export default function ProfileFilterSearch({
  selectedStatusItems,
  onChangeSelectedStatusItems,
  onClearSelectedStatusItems,

  selectedResourceItems,
  onChangeSelectedResourceItems,
  onClearSelectedResourceItems,

  onClearAllSelectedItems,

  search,
  onChangeSearch,

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

  const clearAll = () => {
    onClearAllSelectedItems();
    setFilterSearch('');
  }

  const openProfiles = async () => {
    const params = {
      ids: selected,
    }

    try {
      showLoading();
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
      showLoading();
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
    <div className="mt-20 justify-content-between align-items-center flex">
      <div className="filter-search d-flex gap-10">
        <InputUi
          placeholder='Tìm kiếm profiles ...'
          style={{ width: '250px' }}
          className='custom-input'
          value={filterSearch}
          onChange={(event) => setFilterSearch(event.target.value)}
        />

        <div className="filters-button d-flex gap-10">
          <Popover className='button-dropdown-filter-checkbox'
            trigger={
              <ButtonOutlineTags
                showTagOne
                title={resourcesFilters.name}
                icon={<CirclePlus />}
                className='button-outlined font-inter pointer color-white h-40 fs-13 d-flex'
                selected={selectedResourceItems}
                tags={
                  <Tags
                    selectedItems={selectedResourceItems}
                    convert={convertResource}
                  />

                }
              />
            }
            content={
              <DropdownCheckboxMenu
                convert={convertResource}
                items={resourcesFilters.items}
                selectedItems={selectedResourceItems}
                onChangeSelectedItems={onChangeSelectedResourceItems}
                onClearSelectedItems={onClearSelectedResourceItems}
              />
            }
          />

          <Popover className='button-dropdown-filter-checkbox'
            trigger={
              <ButtonOutlineTags
                title={statusFilters.name}
                icon={<CirclePlus />}
                className='button-outlined font-inter pointer color-white h-40 fs-13 d-flex'
                selected={selectedStatusItems}
                tags={
                  <Tags
                    selectedItems={selectedStatusItems}
                    style={convertStatusCommonEnumToColorHex}
                    convert={convertStatusCommonEnumToText}
                  />

                }
              />
            }
            content={
              <DropdownCheckboxMenu
                convert={convertStatusCommonEnumToText}
                items={statusFilters.items}
                selectedItems={selectedStatusItems}
                onChangeSelectedItems={onChangeSelectedStatusItems}
                onClearSelectedItems={onClearSelectedStatusItems}
              />
            }
          />

          {(selectedStatusItems.length > 0 || filterSearch) &&
            <ButtonGhost
              icon={<ListFilter color={Color.ORANGE} />}
              onClick={clearAll}
            />
          }

        </div>

      </div>
      <div className='flex items-center gap-10'>
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
  )
}

const resourcesFilters = {
  name: 'Tài nguyên',
  items: RESOURCES.map(res => res.id),
};

const statusFilters = {
  name: 'Trạng thái',
  items: [
    StatusCommon.IN_ACTIVE, StatusCommon.UN_ACTIVE
  ],
};

const Tags = ({ selectedItems, style = () => { }, convert }) => {
  return (
    selectedItems.map((item) => {
      return (
        <Badge
          style={{
            backgroundColor: darkenColor(style(item)),
            borderColor: lightenColor(style(item)),
            color: 'white'
          }}
          className='text-capitalize fw-400 fs-12 bdr'
        >
          {convert ? convert(item) : item}
        </Badge>
      )
    })
  )
}
