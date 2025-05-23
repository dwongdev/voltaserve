# Copyright (c) 2023 Anass Bouassaba.
#
# Use of this software is governed by the Business Source License
# included in the file LICENSE in the root of this repository.
#
# As of the Change Date specified in that file, in accordance with
# the Business Source License, use of this software will be governed
# by the GNU Affero General Public License v3.0 only, included in the file
# AGPL-3.0-only in the root of this repository.

FROM golang:1.23-bookworm AS builder

WORKDIR /build

COPY shared ./shared
COPY api ./api
COPY conversion ./conversion
COPY mosaic ./mosaic
COPY webdav ./webdav
COPY ui ./ui
COPY go.work go.work.sum ./

RUN go mod download

WORKDIR /build/conversion

RUN go build -o voltaserve-conversion

FROM ubuntu:noble AS runner

RUN apt-get update && apt-get install -y \
    htop curl ffmpeg gawk ghostscript imagemagick poppler-utils \
    libimage-exiftool-perl ocrmypdf qpdf unzip \
    nodejs npm \
    blender python3-numpy \
    libreoffice libreoffice-core libreoffice-writer libreoffice-calc \
    libreoffice-impress libreoffice-draw libreoffice-math \
    tesseract-ocr tesseract-ocr-osd tesseract-ocr-ara tesseract-ocr-chi-sim \
    tesseract-ocr-chi-tra tesseract-ocr-eng tesseract-ocr-fra tesseract-ocr-deu \
    tesseract-ocr-por tesseract-ocr-spa tesseract-ocr-nld tesseract-ocr-ita \
    tesseract-ocr-jpn tesseract-ocr-nor tesseract-ocr-swe tesseract-ocr-fin \
    tesseract-ocr-dan tesseract-ocr-rus \
    && npm i -g gltf-pipeline@4.1.0 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /build/conversion/voltaserve-conversion ./voltaserve-conversion
COPY --from=builder /build/conversion/.env ./.env

ENTRYPOINT ["./voltaserve-conversion"]

EXPOSE 8083