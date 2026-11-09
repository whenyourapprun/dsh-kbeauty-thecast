# K-Beauty & TheCast — DeepSeek Harness 번들

K-뷰티 전문 지식 **스킬**과 더캐스트(TheCast) **MCP 연계**를 담은 DeepSeek Harness 플러그인 번들입니다.

## 구성

| 파일 | 역할 |
|---|---|
| `package.json` | 번들 매니페스트 (`dsh.bundle.patch`) |
| `cordis.patch.yml` | 로더 패치: `kbeauty` 스킬 플러그인 + `thecast-mcp` MCP 클라이언트 |
| `index.js` | Host 플러그인 — `kbeauty` 스킬을 스킬 레지스트리에 등록 |
| `assets/kbeauty/SKILL.md` | K-뷰티 전문 지식 본문 |
| `assets/kbeauty/references/` | 성분 사전·피부 타입·더캐스트 콘텐츠 플레이북 |
| `locale/*.json` | 플러그인 표시 이름/설명 |
| `icon.svg` | 플러그인 아이콘 |

## 설치

워크스페이스의 이 디렉터리를 `plugin_manager`의 `install_bundle` 대상으로 설치하면 현재 프로필(모든 세션)에 적용됩니다.

## GitHub 배포 & 플러그인 마켓

- 저장소: https://github.com/whenyourapprun/dsh-kbeauty-thecast (공개)
- 패키지명: `@whenyourapprun/dsh-kbeauty-thecast`
- 플러그인 마켓 인덱스: `plugin-index.json` (DSH 포맷 1)
  - 인덱스 URL: `https://raw.githubusercontent.com/whenyourapprun/dsh-kbeauty-thecast/main/plugin-index.json`
- 검색 키워드: k-beauty, kbeauty, skincare, cosmetics, beauty, thecast, 더캐스트, 뷰티, 화장품, 스킨케어, live-commerce, mcp, skill

딥시크에서 설치:

- **Plugin Manager**: 설치된 번들이 `K-Beauty & TheCast (K-뷰티 전문·라이브 커머스)`로 표시되며 위 키워드로 검색됩니다.
- **Discover 탭**: `plugin-market` 번들을 활성화하고 위 인덱스 URL을 `indexes`에 추가하면 마켓에서 검색·설치할 수 있습니다.

## K-Beauty 스킬

설치 후 세션 카탈로그에 `kbeauty` 스킬이 나타나며, 에이전트가 다음 작업에 사용합니다.

- 피부 타입·고민 진단, 성분·루틴 분석과 제품 추천
- 더캐스트 라이브 커머스 대본, 숏폼·피드 스크립트, 상품 설명, 구독 소개 기획/작성
- 한국어·영어 이중 언어 콘텐츠

## 더캐스트(TheCast) MCP 연계

`cordis.patch.yml`의 `thecast-mcp` 행이 `@deepseek-ai/dsh-mcp-client`를 삽입해 `mcp__thecast__*` 도구를 제공합니다. 홈페이지에 추가한 **개발자 포털 + 공개 API + MCP 엔드포인트**에 연결되어 있습니다.

```yaml
- id: thecast-mcp
  name: '@deepseek-ai/dsh-mcp-client'
  config:
    serverName: thecast
    transport: streamable-http
    url: 'https://thecast.blacksmithio.com/mcp'   # TheCast MCP 엔드포인트
    headers: {}
    failOnStartupError: false
```

### MCP 도구 (mcp__thecast__*)

- `search_products` — 이름·브랜드 키워드로 K-뷰티 상품 검색
- `list_brands` — 입점 브랜드 목록
- `list_lives` — 라이브 커머스 방송 목록
- `recommend_products` — 피부 고민 기반 상품 추천

데이터는 실제 castshop 스토어 API에서 제공합니다.

### 더캐스트 개발자 포털 & 공개 API

홈페이지 저장소(`thecast_homepage`)에 다음을 추가해 배포했습니다.

- 개발자 포털: `https://thecast.blacksmithio.com/developers/`
- 공개 API(읽기 전용):
  - `GET /api/v1/brands`, `GET /api/v1/products?query=`, `GET /api/v1/lives?status=`
  - `POST /api/keys` (API 키 발급), `GET /api/keys`
- MCP: `POST https://thecast.blacksmithio.com/mcp`

구현: `thecast_homepage/thecast/developers-api.js` (순수 Node, 빌드 없음).

## 참고: 딥시크 API 키

이 번들과 무관하게, 딥시크 모델 API 키는 https://platform.deepseek.com → API Keys 에서 발급합니다.
