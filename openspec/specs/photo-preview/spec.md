# photo-preview Specification

## Purpose
TBD - created by archiving change fix-qa-defects-260710. Update Purpose after archive.
## Requirements
### Requirement: 照片项统一数据结构

店铺表单与记录表单中，base64 照片传给 `van-uploader` 的列表项时 SHALL 采用统一结构，使 Vant 的缩略图渲染与全屏预览均可用。由于 Vant 全屏预览仅从列表项的 `url` 字段取图源，且其判图逻辑对无扩展名的 `data:` URL 会误判为非图片，列表项 MUST 将 base64 data URL 置于 `url` 字段，并 MUST 显式标记 `isImage: true`。存库时 MUST 从 `url` 抽取 base64 字符串。

#### Scenario: 编辑记录时已存照片正确显示

- **WHEN** 用户打开一条已含照片的记录进行编辑（照片从数据库回填）
- **THEN** 上传区显示照片缩略图，而非 `data:image...` 文本

#### Scenario: 店铺照片全屏预览正确显示

- **WHEN** 用户在店铺表单点击已上传的照片缩略图
- **THEN** 弹出的全屏预览显示该图片，计数显示为 `1/1`（而非空白 `1/0`），并可正常关闭

#### Scenario: 多张照片预览计数正确

- **WHEN** 用户上传多张照片后点击其中一张预览
- **THEN** 预览显示对应图片，且总数与已上传张数一致

