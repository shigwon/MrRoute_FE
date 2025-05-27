// src/utils/domHelpers.js - 안전한 DOM 접근을 위한 헬퍼 함수들

/**
 * 안전하게 DOM 요소에 접근하는 함수
 */
export const safeQuerySelector = (selector) => {
    try {
      return document.querySelector(selector);
    } catch (error) {
      console.warn(`DOM 요소 조회 실패: ${selector}`, error);
      return null;
    }
  };
  
  /**
   * 안전하게 스크롤 위치를 설정하는 함수
   */
  export const safeScrollTo = (options) => {
    try {
      if (typeof options === 'number') {
        window.scrollTo(0, options);
      } else {
        window.scrollTo(options);
      }
    } catch (error) {
      console.warn('스크롤 설정 실패:', error);
    }
  };
  
  /**
   * 안전하게 요소의 스크롤을 최하단으로 이동
   */
  export const safeScrollToBottom = (element) => {
    if (!element) return;
    
    try {
      if (element.scrollHeight && element.clientHeight) {
        element.scrollTop = element.scrollHeight - element.clientHeight;
      }
    } catch (error) {
      console.warn('요소 스크롤 실패:', error);
    }
  };
  
  /**
   * nextTick을 사용한 안전한 DOM 조작
   */
  export const safeNextTick = (callback) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const result = callback();
          resolve(result);
        } catch (error) {
          console.warn('nextTick 콜백 실행 실패:', error);
          resolve(null);
        }
      }, 0);
    });
  };
  
  /**
   * 요소가 DOM에 존재하는지 확인
   */
  export const isElementInDOM = (element) => {
    if (!element) return false;
    
    try {
      return document.contains(element);
    } catch (error) {
      return false;
    }
  };