// Copyright (c) 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file LICENSE in the root of this repository.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// AGPL-3.0-only in the root of this repository.
import { useEffect } from 'react'
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { SectionError, SectionSpinner } from '@koupr/ui'
import { TaskStatus } from '@/client'
import { FileAPI } from '@/client/api/file'
import { errorToString } from '@/client/error'
import { swrConfig } from '@/client/options'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { modalDidClose } from '@/store/ui/mosaic'
import MosaicCreate from './mosaic-create'
import MosaicOverview from './mosaic-overview'

const Mosaic = () => {
  const dispatch = useAppDispatch()
  const id = useAppSelector((state) =>
    state.ui.files.selection.length > 0
      ? state.ui.files.selection[0]
      : undefined,
  )
  const isModalOpen = useAppSelector((state) => state.ui.mosaic.isModalOpen)
  const {
    data: file,
    error: fileError,
    isLoading: fileIsLoading,
  } = FileAPI.useGet(id, swrConfig())
  const fileIsReady = file && !fileError

  useEffect(() => {
    if (file?.snapshot?.task?.status === TaskStatus.Running) {
      dispatch(modalDidClose())
    }
  }, [file])

  return (
    <Modal
      size="xl"
      isOpen={isModalOpen}
      onClose={() => dispatch(modalDidClose())}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Mosaic</ModalHeader>
        <ModalCloseButton />
        {fileIsLoading ? <SectionSpinner /> : null}
        {fileError ? <SectionError text={errorToString(fileError)} /> : null}
        {fileIsReady ? (
          <>
            {file.snapshot?.capabilities.mosaic ? (
              <MosaicOverview />
            ) : (
              <MosaicCreate />
            )}
          </>
        ) : null}
      </ModalContent>
    </Modal>
  )
}

export default Mosaic
