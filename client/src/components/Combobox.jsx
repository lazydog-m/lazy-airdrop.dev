import { Check, ChevronsUpDownIcon, CircleX, X } from "lucide-react"

import Popover from "./Popover"
import { ButtonOutline } from "./Button"
import React, { useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';
import useDebounce from "@/hooks/useDebounce";

export default function Combobox({
  value = '',
  items = [],
  onChange = () => { },
  placeholder,
  placeholderSearch = '',
  capitalize = true,
  convertItem,
  onChangeSearch = () => { },
  searchApi = false,
}) {

  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  const debounceValue = useDebounce(inputValue, 500);

  useEffect(() => {
    onChangeSearch(debounceValue);
  }, [debounceValue]);

  useEffect(() => {
    setFilteredSuggestions(items);
  }, [items])

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (!searchApi) {
      let filtered = [];
      if (convertItem) {
        const convertedItems = items.map(item => {
          return {
            id: item,
            name: convertItem(item),
          }
        }
        );
        filtered = convertedItems?.filter(item =>
          item?.name?.toLowerCase()?.includes(value?.toLowerCase()))
        setFilteredSuggestions(filtered.map(item => item?.id));
      }
      else {
        filtered = items?.filter(item =>
          item?.toLowerCase()?.includes(value?.toLowerCase()))
        setFilteredSuggestions(filtered);
      }
    }
  }

  const handleChangeSelected = (newValue) => {
    onChange(newValue === value ? "" : newValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prevIndex) =>
        Math.min(prevIndex + 1, filteredSuggestions.length - 1)
      );
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prevIndex) =>
        Math.max(prevIndex - 1, 0)
      );
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0) {
        handleChangeSelected(filteredSuggestions[highlightedIndex]);
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    if (dropdownRef.current && highlightedIndex >= 0) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex];
      if (highlightedElement) {
        // Cuộn item vào giữa dropdown
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const highlightedRect = highlightedElement.getBoundingClientRect();

        // Điều chỉnh cuộn cho item
        const offset = highlightedRect.top - dropdownRect.top;
        if (offset < 0) {
          dropdownRef.current.scrollTop += offset - 5; // Cuộn lên một chút
        } else if (offset + highlightedRect.height > dropdownRect.height) {
          dropdownRef.current.scrollTop += offset + highlightedRect.height - dropdownRect.height + 5; // Cuộn xuống một chút
        }
      }
    }
  }, [highlightedIndex]);

  return (
    <Popover
      modal={true}
      trigger={
        <ButtonOutline
          className={`pdi-11 button-outlined-combobox ${value ? `${capitalize && 'text-capitalize'} color-white` : 'text-gray'} mt-10 font-inter w-full fw-400 justify-between select-none font-inter pointer h-40 fs-14 d-flex`}
          role="combobox"
          type='button'
          title={
            <>
              {value ? (convertItem ? convertItem(value) : value) : placeholder}
              <span className="flex items-center gap-10">
                {value &&
                  <button
                    type="button"
                    className="x-modal cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      onChange("");
                    }}
                  >
                    <X />
                  </button>
                }
                <ChevronsUpDownIcon color="#999998" />
              </span>
            </>
          }
        />
      }
      content={
        <div ref={wrapperRef} className="p-0">
          <Input
            className='font-inter custom-input-tag'
            autoComplete='off'
            placeholder={`Tìm kiếm ${placeholderSearch} ...`}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          {filteredSuggestions.length > 0 &&
            <ul className='autocomplete-tag scroll' ref={dropdownRef}>
              {filteredSuggestions.map((item, index) => (
                <li className='autocomplete-tag-item fw-400 d-flex justify-content-between align-items-center'
                  key={index}
                  onClick={() => handleChangeSelected(item)}
                  style={{
                    backgroundColor: (highlightedIndex === index) ? '#323230' : '',
                  }}
                >
                  <span className={`d-flex gap-10 align-items-center ${capitalize && 'text-capitalize'}`}>
                    {convertItem ? convertItem(item) : item}
                  </span>
                  {value === item && <Check size={'16px'} />}
                </li>
              ))}
            </ul>
            ||
            <div
              className='font-inter fs-400 p-21 d-flex justify-center'
            >
              <span>
                {`Không tìm thấy ${placeholderSearch}.`}
              </span>
            </div>
          }
        </div>
      }
    />
  )
}
