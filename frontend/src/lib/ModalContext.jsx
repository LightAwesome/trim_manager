// FILE: src/lib/ModalContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/ui/Modal';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalContent, setModalContent] = useState(null);

  const showModal = useCallback(content => {
    setModalContent(content);
  }, []);

  const hideModal = useCallback(() => {
    setModalContent(null);
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalContent && (
        <Modal onClose={hideModal}>{modalContent}</Modal>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
