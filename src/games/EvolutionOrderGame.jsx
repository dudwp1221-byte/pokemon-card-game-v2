// src/games/EvolutionOrderGame.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { recordScore, getBestScore } from "../lib/miniGameLogic";
import { useSFX, useBGM } from "../lib/sounds"; // ⭐ 사운드 import

const TIME_PER_Q = 8;
const TOTAL_ROUNDS = 15;
const BASE =
  "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/";
const p = (id, n) => ({ id, n });

// { base, correct, decoys[3], hint }
// 핵심: 괴변 진화 + 분기 진화 + 비슷하게 생긴 함정 위주
const QUESTIONS = [
  // ── 완전히 다르게 생긴 진화 ──────────────────────────
  {
    base: p(129, "잉어킹"),
    correct: p(130, "갸라도스"),
    decoys: [p(350, "밀로틱"), p(119, "왕콘치"), p(147, "미뇽")],
    hint: "전혀 다르게 생겼지만 사실 같은 줄기예요!",
  },
  {
    base: p(349, "피비"),
    correct: p(350, "밀로틱"),
    decoys: [p(130, "갸라도스"), p(117, "시드라"), p(226, "만타인")],
    hint: "못생긴 물고기가 아름다운 뱀으로!",
  },
  {
    base: p(265, "나티"),
    correct: p(266, "실쿤"),
    decoys: [p(48, "콘팡"), p(11, "단데기"), p(412, "도롱충이")],
    hint: "나티는 두 방향 중 한 쪽으로만 진화해요",
  },
  {
    base: p(265, "나티"),
    correct: p(268, "카스쿤"),
    decoys: [p(48, "콘팡"), p(412, "도롱충이"), p(14, "딱충이")],
    hint: "나티가 카스쿤이 되는 경우도 있어요!",
  },
  {
    base: p(10, "캐터피"),
    correct: p(11, "단데기"),
    decoys: [p(48, "콘팡"), p(266, "실쿤"), p(268, "카스쿤")],
    hint: "비슷하게 생긴 번데기들이 헷갈리죠",
  },
  {
    base: p(13, "뿔충이"),
    correct: p(14, "딱충이"),
    decoys: [p(48, "콘팡"), p(266, "실쿤"), p(268, "카스쿤")],
    hint: "뿔충이 → 딱충이 → 독침붕",
  },
  // ── 분기 진화 ──
  {
    base: p(79, "야돈"),
    correct: p(80, "야도란"),
    decoys: [p(54, "고라파덕"), p(131, "라프라스"), p(186, "왕구리")],
    hint: "야돈은 두 갈래로 진화해요. 야도란 맞나요?",
  },
  {
    base: p(79, "야돈"),
    correct: p(199, "야도킹"),
    decoys: [p(54, "고라파덕"), p(55, "골덕"), p(131, "라프라스")],
    hint: "야도킹도 야돈의 진화형이에요!",
  },
  {
    base: p(61, "슈륙챙이"),
    correct: p(62, "강챙이"),
    decoys: [p(9, "거북왕"), p(195, "누오"), p(79, "야돈")],
    hint: "물돌로 진화 vs 왕의 징표로 진화",
  },
  {
    base: p(61, "슈륙챙이"),
    correct: p(186, "왕구리"),
    decoys: [p(55, "골덕"), p(195, "누오"), p(9, "거북왕")],
    hint: "폴리토드로도 진화할 수 있어요!",
  },
  {
    base: p(44, "냄새꼬"),
    correct: p(45, "라플레시아"),
    decoys: [p(315, "로젤리아"), p(46, "파라섹트"), p(103, "나시")],
    hint: "냄새꼬 → 라플레시아 or 아르코",
  },
  {
    base: p(44, "냄새꼬"),
    correct: p(182, "아르코"),
    decoys: [p(315, "로젤리아"), p(421, "체리꼬"), p(103, "나시")],
    hint: "해 돌로 진화하면 아르코가 돼요!",
  },
  {
    base: p(281, "킬리아"),
    correct: p(282, "가디안"),
    decoys: [p(65, "후딘"), p(251, "세레비"), p(480, "유크시")],
    hint: "암컷 킬리아 → 가디안, 수컷 킬리아 → 갈레이드",
  },
  {
    base: p(281, "킬리아"),
    correct: p(475, "엘레이드"),
    decoys: [p(125, "에레브"), p(448, "루카리오"), p(150, "뮤츠")],
    hint: "수컷에게 여명의 돌을 쓰면?",
  },
  {
    base: p(361, "눈꼬마"),
    correct: p(362, "얼음귀신"),
    decoys: [p(478, "눈여아"), p(124, "루주라"), p(215, "포푸니")],
    hint: "눈꼬마 → 얼음귀신 or 눈여아",
  },
  {
    base: p(361, "눈꼬마"),
    correct: p(478, "눈여아"),
    decoys: [p(131, "라프라스"), p(124, "루주라"), p(238, "뽀뽀라")],
    hint: "섬의 돌을 쓰면 눈여아가 돼요!",
  },
  {
    base: p(366, "진주몽"),
    correct: p(367, "헌테일"),
    decoys: [p(119, "왕콘치"), p(119, "왕콘치"), p(226, "만타인")],
    hint: "조개킹도 두 갈래예요! 꼬리쪽? 머리쪽?",
  },
  {
    base: p(366, "진주몽"),
    correct: p(368, "분홍장이"),
    decoys: [p(119, "왕콘치"), p(226, "만타인"), p(116, "쏘드라")],
    hint: "왕의 징표 주는 방향에 따라 달라요",
  },
  // ── 배루키 3분기 ──
  {
    base: p(236, "배루키"),
    correct: p(106, "시라소몬"),
    decoys: [p(107, "홍수몬"), p(237, "카포에라"), p(68, "괴력몬")],
    hint: "공격이 높으면 시라소몬, 방어가 높으면 홍수몬, 같으면 카포에라",
  },
  {
    base: p(236, "배루키"),
    correct: p(107, "홍수몬"),
    decoys: [p(106, "시라소몬"), p(237, "카포에라"), p(68, "괴력몬")],
    hint: "방어력 기준으로 진화 갈림!",
  },
  {
    base: p(236, "배루키"),
    correct: p(237, "카포에라"),
    decoys: [p(106, "시라소몬"), p(107, "홍수몬"), p(68, "괴력몬")],
    hint: "공격=방어면 카포에라!",
  },
  // ── 이브이 분기 ──
  {
    base: p(133, "이브이"),
    correct: p(134, "샤미드"),
    decoys: [p(149, "망나뇽"), p(25, "피카츄"), p(143, "잠만보")],
    hint: "물의 돌로 진화!",
  },
  {
    base: p(133, "이브이"),
    correct: p(197, "블래키"),
    decoys: [p(94, "팬텀"), p(131, "라프라스"), p(143, "잠만보")],
    hint: "밤에 친밀도를 높이면?",
  },
  {
    base: p(133, "이브이"),
    correct: p(471, "글레이시아"),
    decoys: [p(131, "라프라스"), p(124, "루주라"), p(362, "얼음귀신")],
    hint: "얼음 바위 근처에서 레벨업?",
  },
  // ── 특이한 진화 ──
  {
    base: p(290, "토중몬"),
    correct: p(291, "아이스크"),
    decoys: [p(40, "푸크린"), p(123, "스라크"), p(212, "핫삼")],
    hint: "토중몬은 진화시 두 마리가 됩니다!",
  },
  {
    base: p(290, "토중몬"),
    correct: p(292, "껍질몬"),
    decoys: [p(40, "푸크린"), p(204, "피콘"), p(213, "단단지")],
    hint: "파티에 빈 자리가 있으면 껍질몬도 생겨요!",
  },
  {
    base: p(412, "도롱충이"),
    correct: p(413, "도롱마담"),
    decoys: [p(414, "나메일"), p(267, "뷰티플라이"), p(269, "독케일")],
    hint: "도롱충이 암컷 → 도롱마담! 수컷은 나메일",
  },
  {
    base: p(412, "도롱충이"),
    correct: p(414, "나메일"),
    decoys: [p(413, "도롱마담"), p(267, "뷰티플라이"), p(413, "도롱마담")],
    hint: "도롱충이 수컷 → 나메일! 암컷은 도롱마담",
  },
  {
    base: p(562, "데스마스"),
    correct: p(563, "데스컨"),
    decoys: [p(710, "호박군"), p(353, "요마"), p(711, "호박왕")],
    hint: "데스마스 vs 갈라르 데스마스, 진화형이 달라요",
  },
  {
    base: p(686, "오케이징"),
    correct: p(687, "칼라마네로"),
    decoys: [p(73, "독파리"), p(139, "암스타"), p(226, "만타인")],
    hint: "DS를 거꾸로 들고 레벨업!",
  },
  // ── 외형 함정 ──
  {
    base: p(52, "나옹"),
    correct: p(53, "페르시온"),
    decoys: [p(432, "몬냥이"), p(431, "나옹마"), p(300, "스케티")],
    hint: "나옹 → 페르시온, 갈라르나옹 → 퍼시커",
  },
  {
    base: p(519, "뭉크새"),
    correct: p(520, "후후새"),
    decoys: [p(16, "구구"), p(396, "찌르꼬"), p(163, "부우부")],
    hint: "비슷하게 생긴 새들이 많죠?",
  },
  {
    base: p(396, "찌르꼬"),
    correct: p(397, "찌르버드"),
    decoys: [p(17, "피죤"), p(520, "후후새"), p(163, "부우부")],
    hint: "찌르꼬 → 찌르버드 → 찌르호크",
  },
  // ── 역변 계열 ──
  {
    base: p(725, "냐오불"),
    correct: p(727, "어흥염"),
    decoys: [p(392, "초염몽"), p(257, "번치코"), p(500, "염무왕")],
    hint: "귀여운 고양이가 근육질 레슬러가 됩니다!",
  },
  {
    base: p(498, "뚜꾸리"),
    correct: p(500, "염무왕"),
    decoys: [p(727, "어흥염"), p(257, "번치코"), p(392, "초염몽")],
    hint: "귀여운 불꽃 돼지 → 거대한 레슬러 돼지!",
  },
  {
    base: p(393, "팽도리"),
    correct: p(395, "엠페르트"),
    decoys: [p(260, "대짱이"), p(160, "장크로다일"), p(503, "대검귀")],
    hint: "귀여운 펭귄이 강철 황제가 됩니다!",
  },
  {
    base: p(443, "딥상어동"),
    correct: p(445, "한카리아스"),
    decoys: [p(373, "보만다"), p(149, "망나뇽"), p(248, "마기라스")],
    hint: "작은 상어 → 드래곤 최강 중 하나!",
  },
  {
    base: p(371, "아공이"),
    correct: p(373, "보만다"),
    decoys: [p(445, "한카리아스"), p(149, "망나뇽"), p(635, "삼삼드래")],
    hint: "날기를 꿈꾸던 아공이가 결국 하늘을!",
  },
  {
    base: p(246, "애버라스"),
    correct: p(248, "마기라스"),
    decoys: [p(445, "한카리아스"), p(373, "보만다"), p(142, "프테라")],
    hint: "작은 초록 도마뱀 → 거대한 공룡!",
  },
  {
    base: p(633, "모노두"),
    correct: p(635, "삼삼드래"),
    decoys: [p(248, "마기라스"), p(445, "한카리아스"), p(149, "망나뇽")],
    hint: "귀여운 드래곤이 3개 머리로!",
  },
  {
    base: p(837, "탄동"),
    correct: p(839, "석탄산"),
    decoys: [p(476, "프로보패스"), p(464, "돌크로스"), p(185, "꼬지모")],
    hint: "작은 석탄 굴리던 아이 → 거대한 석탄 괴물!",
  },
  {
    base: p(885, "드라꼰"),
    correct: p(887, "드래펄트"),
    decoys: [p(426, "둥실라이드"), p(773, "실버디"), p(375, "메탕구")],
    hint: "작은 유령 → 스텔스 폭격기 드래곤!",
  },
  {
    base: p(529, "두더류"),
    correct: p(530, "몰드류"),
    decoys: [p(373, "보만다"), p(450, "하마돈"), p(639, "테라키온")],
    hint: "두더지가 드릴로 진화하다니!",
  },
  {
    base: p(574, "고치루"),
    correct: p(576, "란쿨루스"),
    decoys: [p(282, "가디안"), p(122, "마임맨"), p(196, "에브이")],
    hint: "작은 초록 세포 → 세포 속 인형!",
  },
  {
    base: p(599, "기어르"),
    correct: p(601, "기어르토"),
    decoys: [p(476, "프로보패스"), p(437, "동탁군"), p(379, "레지스틸")],
    hint: "기어 하나 → 거대한 기계로 합체!",
  },
  {
    base: p(636, "활화르바"),
    correct: p(637, "불카모스"),
    decoys: [p(6, "리자몽"), p(257, "번치코"), p(392, "초염몽")],
    hint: "불꽃 애벌레가 거대 나방이 됩니다",
  },
  {
    base: p(824, "두루지벌레"),
    correct: p(826, "이올브"),
    decoys: [p(336, "자리나"), p(472, "글라이온"), p(211, "침바루")],
    hint: "벌레 애벌레 → 에스퍼 두뇌파 무당벌레!",
  },
  {
    base: p(840, "사과벌레"),
    correct: p(842, "달콤꿀"),
    decoys: [p(841, "애프룡"), p(455, "무쉬로트"), p(556, "마라카치")],
    hint: "사과벌레 → 사과파이? 달콤꿀이에요!",
  },
  {
    base: p(840, "사과벌레"),
    correct: p(841, "애프룡"),
    decoys: [p(842, "달콤꿀"), p(780, "나겸나"), p(556, "마라카치")],
    hint: "사과벌레가 드래곤이 되는 경우도!",
  },
  {
    base: p(509, "소냥"),
    correct: p(510, "레파르다스"),
    decoys: [p(53, "페르시온"), p(431, "나옹마"), p(300, "스케티")],
    hint: "작은 고양이가 표범으로!",
  },
  {
    base: p(610, "터검니"),
    correct: p(612, "액스라이즈"),
    decoys: [p(373, "보만다"), p(445, "한카리아스"), p(149, "망나뇽")],
    hint: "뿔 하나 → 도끼 두 개!",
  },
  {
    base: p(686, "오케이징"),
    correct: p(687, "칼라마네로"),
    decoys: [p(73, "독파리"), p(139, "암스타"), p(226, "만타인")],
    hint: "닌텐도DS를 거꾸로 들고 레벨업!",
  },
  {
    base: p(704, "미끄메라"),
    correct: p(706, "미끄래곤"),
    decoys: [p(445, "한카리아스"), p(230, "킹드라"), p(149, "망나뇽")],
    hint: "귀여운 점액질 → 거대 끈적 드래곤",
  },
  {
    base: p(789, "코스모그"),
    correct: p(791, "솔가레오"),
    decoys: [p(792, "루나아라"), p(150, "뮤츠"), p(716, "제르네아스")],
    hint: "작은 안개 덩어리 → 태양의 신!",
  },
  {
    base: p(789, "코스모그"),
    correct: p(792, "루나아라"),
    decoys: [p(791, "솔가레오"), p(249, "루기아"), p(717, "이벨타르")],
    hint: "코스모그 → 코스모움 → 달의 신!",
  },
  {
    base: p(833, "깨물부기"),
    correct: p(834, "갈가부기"),
    decoys: [p(130, "갸라도스"), p(160, "장크로다일"), p(248, "마기라스")],
    hint: "귀여운 아기 거북이 → 무장 악어 갈가부기!",
  },
  // ── 소곤룡 ──
  {
    base: p(714, "음뱃"),
    correct: p(715, "음번"),
    decoys: [p(149, "망나뇽"), p(373, "보만다"), p(445, "한카리아스")],
    hint: "레벨 48이 돼야 진화해요! 늦게 크는 드래곤",
  },
  // ── 정상 진화 ──
  {
    base: p(1, "이상해씨"),
    correct: p(2, "이상해풀"),
    decoys: [p(152, "치코리타"), p(387, "나무꼬"), p(253, "나무돌이")],
    hint: "1세대 풀 스타터!",
  },
  {
    base: p(4, "파이리"),
    correct: p(5, "리자드"),
    decoys: [p(155, "브케인"), p(391, "파이숭이"), p(390, "불꽃숭이")],
    hint: "불꽃 도마뱀 스타터!",
  },
  {
    base: p(7, "꼬부기"),
    correct: p(8, "어니부기"),
    decoys: [p(158, "리아코"), p(393, "팽도리"), p(501, "수댕이")],
    hint: "물 거북 스타터!",
  },
  {
    base: p(152, "치코리타"),
    correct: p(153, "베이리프"),
    decoys: [p(1, "이상해씨"), p(252, "나무지기"), p(387, "나무꼬")],
    hint: "2세대 풀 스타터!",
  },
  {
    base: p(155, "브케인"),
    correct: p(156, "마그케인"),
    decoys: [p(4, "파이리"), p(255, "아차모"), p(390, "불꽃숭이")],
    hint: "2세대 불꽃 스타터!",
  },
  {
    base: p(252, "나무지기"),
    correct: p(253, "나무돌이"),
    decoys: [p(1, "이상해씨"), p(152, "치코리타"), p(387, "나무꼬")],
    hint: "3세대 풀 스타터!",
  },
  {
    base: p(255, "아차모"),
    correct: p(256, "영치코"),
    decoys: [p(4, "파이리"), p(155, "브케인"), p(390, "불꽃숭이")],
    hint: "3세대 불꽃 스타터!",
  },
  {
    base: p(258, "물짱이"),
    correct: p(259, "늪짱이"),
    decoys: [p(7, "꼬부기"), p(158, "리아코"), p(501, "수댕이")],
    hint: "3세대 물 스타터!",
  },
  {
    base: p(387, "나무꼬"),
    correct: p(388, "수풀부기"),
    decoys: [p(1, "이상해씨"), p(152, "치코리타"), p(252, "나무지기")],
    hint: "4세대 풀 스타터!",
  },
  {
    base: p(390, "불꽃숭이"),
    correct: p(391, "파이숭이"),
    decoys: [p(4, "파이리"), p(155, "브케인"), p(255, "아차모")],
    hint: "4세대 불꽃 스타터!",
  },
  {
    base: p(393, "팽도리"),
    correct: p(394, "팽태자"),
    decoys: [p(7, "꼬부기"), p(158, "리아코"), p(501, "수댕이")],
    hint: "4세대 물 스타터!",
  },
  {
    base: p(495, "주리비얀"),
    correct: p(496, "샤비"),
    decoys: [p(152, "치코리타"), p(1, "이상해씨"), p(387, "나무꼬")],
    hint: "5세대 풀 스타터! (미끈한 뱀형)",
  },
  // ── 드래곤 ──
  {
    base: p(147, "미뇽"),
    correct: p(148, "신뇽"),
    decoys: [p(371, "아공이"), p(443, "딥상어동"), p(610, "터검니")],
    hint: "미뇽 → 신뇽 → 망나뇽!",
  },
  {
    base: p(148, "신뇽"),
    correct: p(149, "망나뇽"),
    decoys: [p(373, "보만다"), p(445, "한카리아스"), p(635, "삼삼드래")],
    hint: "신뇽이 드디어 날개를 얻어요!",
  },
  {
    base: p(246, "애버라스"),
    correct: p(247, "데기라스"),
    decoys: [p(371, "아공이"), p(443, "딥상어동"), p(633, "모노두")],
    hint: "애버라스 → 산딱구리 → 마기라스",
  },
  {
    base: p(444, "한바이트"),
    correct: p(445, "한카리아스"),
    decoys: [p(372, "쉘곤"), p(373, "보만다"), p(149, "망나뇽")],
    hint: "날카로스가 진화하면?",
  },
  // ── 유령/에스퍼 ──
  {
    base: p(92, "고오스"),
    correct: p(93, "고우스트"),
    decoys: [p(355, "해골몽"), p(200, "무우마"), p(353, "요마")],
    hint: "고스 → 고우스트 → 팬텀",
  },
  {
    base: p(63, "캐이시"),
    correct: p(64, "윤겔라"),
    decoys: [p(280, "랄토스"), p(574, "고치루"), p(196, "에브이")],
    hint: "케이시가 숟가락을 구부려요!",
  },
  {
    base: p(64, "윤겔라"),
    correct: p(65, "후딘"),
    decoys: [p(282, "가디안"), p(124, "루주라"), p(196, "에브이")],
    hint: "통신 교환으로 진화해요!",
  },
  {
    base: p(280, "랄토스"),
    correct: p(281, "킬리아"),
    decoys: [p(63, "캐이시"), p(574, "고치루"), p(196, "에브이")],
    hint: "랄토스 → 킬리아 → 가디안/갈레이드",
  },
  // ── 격투/노말 ──
  {
    base: p(66, "알통몬"),
    correct: p(67, "근육몬"),
    decoys: [p(66, "알통몬"), p(297, "하리뭉"), p(447, "리오르")],
    hint: "마크탕 → 근육몬 → 괴력몬",
  },
  {
    base: p(447, "리오르"),
    correct: p(448, "루카리오"),
    decoys: [p(237, "카포에라"), p(106, "시라소몬"), p(475, "엘레이드")],
    hint: "리오루는 친밀도로 진화해요!",
  },
  {
    base: p(296, "마크탕"),
    correct: p(297, "하리뭉"),
    decoys: [p(66, "알통몬"), p(296, "마크탕"), p(447, "리오르")],
    hint: "두꺼운 지방으로 덮인 격투 포켓몬",
  },
  // ── 물 ──
  {
    base: p(116, "쏘드라"),
    correct: p(117, "시드라"),
    decoys: [p(86, "쥬쥬"), p(341, "어시카꼬"), p(131, "라프라스")],
    hint: "홍수몬 → 씨드라 → 킹드라!",
  },
  {
    base: p(117, "시드라"),
    correct: p(230, "킹드라"),
    decoys: [p(130, "갸라도스"), p(149, "망나뇽"), p(350, "밀로틱")],
    hint: "통신교환 + 용의비늘로 진화!",
  },
  {
    base: p(183, "마릴"),
    correct: p(184, "마릴리"),
    decoys: [p(39, "푸린"), p(113, "럭키"), p(440, "핑복")],
    hint: "귀여운 물 마우스가 커져요!",
  },
  // ── 곤충 ──
  {
    base: p(401, "콩둘기"),
    correct: p(402, "크리켓"),
    decoys: [p(415, "미츠하니"), p(543, "야나야끼"), p(313, "볼비트")],
    hint: "콩둘기 → 크리켓, 레벨 25에 진화",
  },
  {
    base: p(415, "미츠하니"),
    correct: p(416, "비퀸"),
    decoys: [p(314, "네오비트"), p(402, "크리켓"), p(291, "아이스크")],
    hint: "암컷만 비퀸이 돼요! 수컷은 진화 못해요",
  },
  {
    base: p(218, "마그마그"),
    correct: p(219, "마그카르고"),
    decoys: [p(154, "메가니움"), p(38, "나인테일"), p(136, "부스터")],
    hint: "마그마가 굳어서 달팽이가 됩니다!",
  },
  {
    base: p(100, "찌리리공"),
    correct: p(101, "붐볼"),
    decoys: [p(81, "코일"), p(299, "코코파스"), p(137, "폴리곤")],
    hint: "찌리리공 → 붐볼, 레벨 30!",
  },
  {
    base: p(81, "코일"),
    correct: p(82, "레어코일"),
    decoys: [p(100, "찌리리공"), p(137, "폴리곤"), p(299, "코코파스")],
    hint: "코일 셋이 합체해요!",
  },
  {
    base: p(236, "배루키"),
    correct: p(106, "시라소몬"),
    decoys: [p(107, "홍수몬"), p(237, "카포에라"), p(297, "하리뭉")],
    hint: "공격 > 방어면 시라소몬!",
  },
  {
    base: p(60, "발챙이"),
    correct: p(61, "슈륙챙이"),
    decoys: [p(194, "우파"), p(270, "수련꼬"), p(258, "물짱이")],
    hint: "발챙이 → 슈륙챙이 → 강챙이/폴리토드",
  },
  {
    base: p(360, "배쥐"),
    correct: p(202, "마자용"),
    decoys: [p(113, "럭키"), p(242, "해피너스"), p(440, "핑복")],
    hint: "배쥐의 알에서 마자용이 나와요!",
  },
  {
    base: p(293, "소곤룡"),
    correct: p(295, "폭음룡"),
    decoys: [p(39, "푸린"), p(40, "푸크린"), p(163, "부우부")],
    hint: "귀여운 아기가 입 큰 괴물로 역변! 3세대 트라우마",
  },
  {
    base: p(293, "소곤룡"),
    correct: p(294, "노공룡"),
    decoys: [p(163, "부우부"), p(39, "푸린"), p(163, "부우부")],
    hint: "소곤룡 → 노공룡 → 폭음룡 순서!",
  },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const EVO_LINES = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11, 12],
  [13, 14, 15],
  [16, 17, 18],
  [19, 20],
  [23, 24],
  [25, 26, 172],
  [27, 28],
  [35, 36],
  [37, 38],
  [39, 40, 174],
  [41, 42, 169],
  [43, 44, 45],
  [46, 47],
  [48, 49],
  [50, 51],
  [52, 53],
  [54, 55],
  [56, 57],
  [58, 59],
  [60, 61, 62],
  [60, 61, 186],
  [63, 64, 65],
  [66, 67, 68],
  [69, 70, 71],
  [72, 73],
  [74, 75, 76],
  [77, 78],
  [79, 80, 199],
  [81, 82, 462],
  [84, 85],
  [86, 87],
  [88, 89],
  [90, 91],
  [92, 93, 94],
  [96, 97],
  [98, 99],
  [100, 101],
  [102, 103],
  [104, 105],
  [109, 110],
  [111, 112, 464],
  [113, 242],
  [114, 465],
  [116, 117, 230],
  [118, 119],
  [120, 121],
  [122],
  [123],
  [124],
  [125, 466],
  [126, 467],
  [127],
  [129, 130],
  [131],
  [133, 134, 135, 136, 196, 197, 470, 471],
  [137, 233, 474],
  [138, 139],
  [140, 141],
  [142],
  [143],
  [147, 148, 149],
  [150],
  [151],
  [152, 153, 154],
  [155, 156, 157],
  [158, 159, 160],
  [161, 162],
  [163, 164],
  [165, 166],
  [167, 168],
  [170, 171],
  [172, 25, 26],
  [173, 35, 36],
  [174, 39, 40],
  [175, 176, 468],
  [179, 180, 181],
  [183, 184],
  [185],
  [186, 60, 61],
  [190, 424],
  [193, 469],
  [194, 195],
  [202],
  [204, 205],
  [206],
  [209, 210],
  [211, 212],
  [213],
  [214],
  [215, 461],
  [216, 217],
  [218, 219],
  [220, 221, 473],
  [223, 224],
  [225],
  [226],
  [227],
  [228, 229],
  [230, 117, 116],
  [233, 474],
  [236, 106, 107, 237],
  [238, 124],
  [239, 125, 466],
  [240, 126, 467],
  [241],
  [242, 113],
  [243],
  [244],
  [245],
  [246, 247, 248],
  [249],
  [250],
  [251],
  [252, 253, 254],
  [255, 256, 257],
  [258, 259, 260],
  [261, 262],
  [265, 266, 267],
  [265, 268, 269],
  [270, 271, 272],
  [273, 274, 275],
  [276, 277],
  [278, 279],
  [280, 281, 282],
  [280, 281, 475],
  [283, 284],
  [285, 286],
  [287, 288, 289],
  [290, 291],
  [290, 292],
  [293, 294, 295],
  [296, 297],
  [299, 476],
  [300, 301],
  [302],
  [304, 305, 306],
  [307, 308],
  [309, 310],
  [311],
  [312],
  [315, 407],
  [316, 317],
  [318, 319],
  [320, 321],
  [322, 323],
  [324],
  [325, 326],
  [327],
  [328, 329, 330],
  [331, 332],
  [333, 334],
  [335, 336],
  [337],
  [338],
  [339, 340],
  [341, 342],
  [343, 344],
  [345, 346],
  [347, 348],
  [349, 350],
  [352],
  [353, 354],
  [355, 356, 477],
  [357],
  [358],
  [359],
  [361, 362, 478],
  [363, 364, 365],
  [366, 367],
  [366, 368],
  [369],
  [370],
  [371, 372, 373],
  [374, 375, 376],
  [377],
  [378],
  [379],
  [380],
  [381],
  [382],
  [383],
  [384],
  [385],
  [386],
];

function sameEvoLine(id1, id2) {
  return EVO_LINES.some((line) => line.includes(id1) && line.includes(id2));
}

function makeQuestion(usedIdx) {
  const available = QUESTIONS.map((_, i) => i).filter((i) => !usedIdx.has(i));
  const pool = available.length > 0 ? available : QUESTIONS.map((_, i) => i);
  const idx = pool[Math.floor(Math.random() * pool.length)];
  const q = QUESTIONS[idx];

  const finalDecoys = [];
  const takenIds = new Set();
  const addToTaken = (id) => {
    takenIds.add(id);
    EVO_LINES.forEach((line) => {
      if (line.includes(id)) line.forEach((i) => takenIds.add(i));
    });
  };
  addToTaken(q.base.id);
  addToTaken(q.correct.id);

  const conflictsWithTaken = (id) =>
    takenIds.has(id) ||
    EVO_LINES.some(
      (line) => line.includes(id) && line.some((i) => takenIds.has(i))
    );

  for (const d of q.decoys) {
    if (finalDecoys.length >= 3) break;
    if (!conflictsWithTaken(d.id) && !finalDecoys.some((f) => f.id === d.id)) {
      finalDecoys.push(d);
      addToTaken(d.id);
    }
  }

  if (finalDecoys.length < 3) {
    const allPokemon = shuffle(
      QUESTIONS.flatMap((qq) => [qq.correct, ...qq.decoys])
    );
    for (const pk of allPokemon) {
      if (finalDecoys.length >= 3) break;
      if (
        !conflictsWithTaken(pk.id) &&
        !finalDecoys.some((f) => f.id === pk.id)
      ) {
        finalDecoys.push(pk);
        addToTaken(pk.id);
      }
    }
  }

  const choices = shuffle([q.correct, ...finalDecoys.slice(0, 3)]);
  return { ...q, choices, idx };
}

export default function EvolutionOrderGame({ onClose, onGameEnd }) {
  const [phase, setPhase] = useState("ready");
  const [q, setQ] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);

  // ⭐ 사운드 훅
  const { play } = useSFX();
  useBGM("evolutionBgm", { enabled: phase === "playing" });

  const scoreRef = useRef(0);
  const roundRef = useRef(0);
  const usedRef = useRef(new Set());
  const timerRef = useRef(null);
  const phaseRef = useRef("ready");
  const timeRef = useRef(TIME_PER_Q);
  const displayQRef = useRef(null);

  const best = getBestScore("evolution_order");

  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    phaseRef.current = "result";
    setPhase("result");
    const res = recordScore("evolution_order", scoreRef.current);
    setResult({ score: scoreRef.current, ...res });
    // ⭐ 게임 종료
    play("gameOverMG");
    if (res.isNew) setTimeout(() => play("newRecord"), 700);
    onGameEnd?.(scoreRef.current);
  }, [onGameEnd, play]);

  const nextQ = useCallback(() => {
    clearInterval(timerRef.current);
    if (roundRef.current >= TOTAL_ROUNDS) {
      endGame();
      return;
    }
    const question = makeQuestion(usedRef.current);
    usedRef.current.add(question.idx);
    roundRef.current++;
    displayQRef.current = question;
    setRound(roundRef.current);
    setQ(question);
    setSelected(null);
    setFeedback(null);
    setShowHint(false);
    setTimeLeft(TIME_PER_Q);
    timeRef.current = TIME_PER_Q;
    phaseRef.current = "playing";
    setPhase("playing");

    timerRef.current = setInterval(() => {
      timeRef.current--;
      setTimeLeft(timeRef.current);
      // ⭐ 3초 이하 틱
      if (timeRef.current <= 3 && timeRef.current > 0) play("quizTick");
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current);
        setFeedback("timeout");
        play("quizTimeout"); // ⭐ 시간 초과
        setTimeout(() => nextQ(), 1200);
      }
    }, 1000);
  }, [endGame, play]);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    roundRef.current = 0;
    usedRef.current = new Set();
    setScore(0);
    setRound(0);
    setResult(null);
    nextQ();
  }, [nextQ]);

  const handleTap = useCallback(
    (choice) => {
      if (phaseRef.current !== "playing" || feedback) return;
      clearInterval(timerRef.current);
      setSelected(choice);

      const correct = choice.id === q.correct.id;
      if (correct) {
        const pts = 10 + Math.ceil(timeRef.current * 2);
        scoreRef.current += pts;
        setScore(scoreRef.current);
        setFeedback("correct");
        play("quizCorrect"); // ⭐ 정답
      } else {
        setFeedback("wrong");
        play("quizWrong"); // ⭐ 오답
      }
      setTimeout(() => nextQ(), 1300);
    },
    [q, feedback, nextQ, play]
  );

  useEffect(() => () => clearInterval(timerRef.current), []);

  const timerPct = (timeLeft / TIME_PER_Q) * 100;
  const timerColor =
    timeLeft <= 3 ? "#ef4444" : timeLeft <= 5 ? "#f59e0b" : "#4ade80";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "linear-gradient(160deg,#0f172a,#1e1b4b)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui,sans-serif",
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(0,0,0,0.4)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 99,
            color: "rgba(255,255,255,0.7)",
            fontSize: 13,
            padding: "5px 12px",
            cursor: "pointer",
          }}
        >
          ← 나가기
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18 }}>🧬</span>
          <span style={{ fontWeight: 900, color: "#fff", fontSize: 16 }}>
            진화 순서 맞추기
          </span>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "4px 10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
            최고
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#818cf8" }}>
            {best > 0 ? best : "—"}
          </div>
        </div>
      </div>

      {phase === "ready" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            padding: 32,
          }}
        >
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <img
              src={`${BASE}129.png`}
              alt=""
              style={{ width: 60, height: 60, objectFit: "contain" }}
            />
            <span style={{ fontSize: 28, color: "rgba(255,255,255,0.4)" }}>
              →
            </span>
            <span style={{ fontSize: 28 }}>❓</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#fff",
                marginBottom: 10,
              }}
            >
              진화 순서 맞추기
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 2.1,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "12px 20px",
              }}
            >
              주어진 포켓몬의 <b>다음 진화</b>를 고르세요
              <br />
              분기 진화 · 괴변 진화 위주로 나와요
              <br />
              <span style={{ color: "#f87171" }}>비슷하게 생긴 함정</span>을
              조심하세요!
              <br />
              빨리 맞출수록 보너스 점수
            </div>
          </div>
          <button
            onClick={startGame}
            style={{
              background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
              border: "none",
              borderRadius: 20,
              color: "#fff",
              fontWeight: 900,
              fontSize: 18,
              padding: "14px 48px",
              cursor: "pointer",
              boxShadow: "0 6px 0 #3730a3",
            }}
          >
            시작!
          </button>
        </div>
      )}

      {phase === "playing" && q && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "12px 16px",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              {round} / {TOTAL_ROUNDS}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#818cf8" }}>
              {score}pt
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: timerColor }}>
              {timeLeft}s
            </div>
          </div>
          <div
            style={{
              height: 5,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${timerPct}%`,
                background: timerColor,
                borderRadius: 99,
                transition: "width 1s linear",
              }}
            />
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            이 포켓몬의 다음 진화는?
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.07)",
                borderRadius: 20,
                padding: "12px 24px",
                border: "2px solid rgba(129,140,248,0.4)",
              }}
            >
              <img
                src={`${BASE}${q.base.id}.png`}
                alt={q.base.n}
                style={{
                  width: 90,
                  height: 90,
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 12px rgba(129,140,248,0.6))",
                }}
              />
              <div
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#fff",
                  marginTop: 4,
                }}
              >
                {q.base.n}
              </div>
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  background: "#4f46e5",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 900,
                  borderRadius: 99,
                  padding: "2px 8px",
                }}
              >
                주제
              </div>
            </div>
            <div style={{ fontSize: 24, color: "rgba(255,255,255,0.4)" }}>
              ↓
            </div>
          </div>

          {feedback && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              {feedback === "correct" && (
                <div
                  style={{ fontSize: 18, fontWeight: 900, color: "#4ade80" }}
                >
                  ✅ 정답! +{10 + Math.ceil(timeRef.current * 2 + 2)}pt
                </div>
              )}
              {feedback === "wrong" && (
                <div
                  style={{ fontSize: 18, fontWeight: 900, color: "#ef4444" }}
                >
                  ❌ 오답! 정답:{" "}
                  <span style={{ color: "#fcd34d" }}>{q.correct.n}</span>
                </div>
              )}
              {feedback === "timeout" && (
                <div
                  style={{ fontSize: 18, fontWeight: 900, color: "#f59e0b" }}
                >
                  ⏰ 시간 초과! 정답:{" "}
                  <span style={{ color: "#fcd34d" }}>{q.correct.n}</span>
                </div>
              )}
              {(feedback === "wrong" || feedback === "timeout") && (
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                    marginTop: 4,
                  }}
                >
                  {q.hint}
                </div>
              )}
            </div>
          )}

          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {(displayQRef.current?.choices || q?.choices || []).map(
                (choice) => {
                  const isCorrect =
                    choice.id ===
                    (displayQRef.current?.correct?.id ?? q?.correct?.id);
                  const isSelected = selected?.id === choice.id;
                  let bg = "rgba(255,255,255,0.06)";
                  let border = "rgba(255,255,255,0.15)";
                  if (feedback) {
                    if (isCorrect) {
                      bg = "rgba(74,222,128,0.2)";
                      border = "#4ade80";
                    } else if (isSelected) {
                      bg = "rgba(239,68,68,0.2)";
                      border = "#ef4444";
                    }
                  }
                  return (
                    <div
                      key={choice.id}
                      onClick={() => handleTap(choice)}
                      style={{
                        background: bg,
                        border: `2px solid ${border}`,
                        borderRadius: 16,
                        padding: "10px 6px",
                        textAlign: "center",
                        cursor: feedback ? "default" : "pointer",
                        transition: "border 0.15s, background 0.15s",
                        transform:
                          isSelected && feedback ? "scale(0.97)" : "scale(1)",
                      }}
                    >
                      <img
                        src={`${BASE}${choice.id}.png`}
                        alt={choice.n}
                        style={{
                          width: 70,
                          height: 70,
                          objectFit: "contain",
                          filter:
                            feedback && isCorrect
                              ? "drop-shadow(0 0 10px #4ade80)"
                              : "none",
                        }}
                      />
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.8)",
                          marginTop: 4,
                          fontWeight: 600,
                        }}
                      >
                        {choice.n}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      {phase === "result" && result && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            padding: 32,
          }}
        >
          {result.isNew && (
            <div
              style={{
                background: "linear-gradient(135deg,#ffd700,#ff8c00)",
                color: "#000",
                fontWeight: 900,
                fontSize: 15,
                padding: "6px 24px",
                borderRadius: 99,
              }}
            >
              🏆 최고 기록!
            </div>
          )}
          <div style={{ fontSize: 56 }}>🧬</div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 4,
              }}
            >
              최종 점수
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: "#818cf8",
                lineHeight: 1,
              }}
            >
              {result.score}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                marginTop: 4,
              }}
            >
              {TOTAL_ROUNDS}문제 완료
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={startGame}
              style={{
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                border: "none",
                borderRadius: 16,
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
                padding: "12px 32px",
                cursor: "pointer",
                boxShadow: "0 4px 0 #3730a3",
              }}
            >
              다시!
            </button>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 16,
                color: "rgba(255,255,255,0.75)",
                fontWeight: 700,
                fontSize: 16,
                padding: "12px 32px",
                cursor: "pointer",
              }}
            >
              나가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
