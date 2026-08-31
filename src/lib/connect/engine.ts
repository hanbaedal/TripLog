import { AIRPORTS, cityOf } from '../../data/airports'
import type { FlightOffer, HotelOffer } from '../../types'

type FlightTemplate = {
  from: string
  to: string
  airline: string
  airlineCode: string
  flightNo: string
  depart: string
  arrive: string
  plusDay?: number
  duration: string
  base: number
}

const FLIGHTS: FlightTemplate[] = [
  { from: 'ICN', to: 'KIX', airline: '대한항공', airlineCode: 'KE', flightNo: '723', depart: '07:55', arrive: '09:35', duration: '1시간 40분', base: 168000 },
  { from: 'ICN', to: 'KIX', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '114', depart: '09:20', arrive: '11:05', duration: '1시간 45분', base: 154000 },
  { from: 'ICN', to: 'KIX', airline: '제주항공', airlineCode: '7C', flightNo: '1304', depart: '12:40', arrive: '14:15', duration: '1시간 35분', base: 98000 },
  { from: 'ICN', to: 'KIX', airline: '티웨이항공', airlineCode: 'TW', flightNo: '285', depart: '16:10', arrive: '17:50', duration: '1시간 40분', base: 92000 },
  { from: 'ICN', to: 'KIX', airline: '피치항공', airlineCode: 'MM', flightNo: '702', depart: '19:30', arrive: '21:10', duration: '1시간 40분', base: 79000 },
  { from: 'KIX', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '728', depart: '16:25', arrive: '18:10', duration: '1시간 45분', base: 168000 },
  { from: 'KIX', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '115', depart: '12:05', arrive: '13:50', duration: '1시간 45분', base: 154000 },
  { from: 'KIX', to: 'ICN', airline: '제주항공', airlineCode: '7C', flightNo: '1305', depart: '20:40', arrive: '22:20', duration: '1시간 40분', base: 98000 },
  { from: 'KIX', to: 'ICN', airline: '티웨이항공', airlineCode: 'TW', flightNo: '286', depart: '10:20', arrive: '12:05', duration: '1시간 45분', base: 92000 },
  { from: 'ICN', to: 'NRT', airline: '대한항공', airlineCode: 'KE', flightNo: '703', depart: '08:10', arrive: '10:35', duration: '2시간 25분', base: 210000 },
  { from: 'ICN', to: 'NRT', airline: '진에어', airlineCode: 'LJ', flightNo: '201', depart: '13:50', arrive: '16:20', duration: '2시간 30분', base: 132000 },
  { from: 'NRT', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '704', depart: '17:40', arrive: '20:15', duration: '2시간 35분', base: 210000 },
  { from: 'NRT', to: 'ICN', airline: '진에어', airlineCode: 'LJ', flightNo: '202', depart: '11:10', arrive: '13:40', duration: '2시간 30분', base: 132000 },
  { from: 'GMP', to: 'HND', airline: '대한항공', airlineCode: 'KE', flightNo: '2101', depart: '08:00', arrive: '10:10', duration: '2시간 10분', base: 198000 },
  { from: 'GMP', to: 'HND', airline: '일본항공', airlineCode: 'JL', flightNo: '92', depart: '14:30', arrive: '16:40', duration: '2시간 10분', base: 205000 },
  { from: 'HND', to: 'GMP', airline: '대한항공', airlineCode: 'KE', flightNo: '2102', depart: '18:20', arrive: '20:35', duration: '2시간 15분', base: 198000 },
  { from: 'HND', to: 'GMP', airline: '일본항공', airlineCode: 'JL', flightNo: '93', depart: '11:00', arrive: '13:20', duration: '2시간 20분', base: 205000 },
  { from: 'ICN', to: 'HND', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '1046', depart: '07:40', arrive: '10:05', duration: '2시간 25분', base: 188000 },
  { from: 'HND', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '1047', depart: '19:10', arrive: '21:40', duration: '2시간 30분', base: 188000 },
  { from: 'ICN', to: 'FUK', airline: '에어부산', airlineCode: 'BX', flightNo: '172', depart: '09:15', arrive: '10:30', duration: '1시간 15분', base: 89000 },
  { from: 'FUK', to: 'ICN', airline: '에어부산', airlineCode: 'BX', flightNo: '173', depart: '18:50', arrive: '20:10', duration: '1시간 20분', base: 89000 },
  { from: 'PUS', to: 'KIX', airline: '에어부산', airlineCode: 'BX', flightNo: '180', depart: '10:05', arrive: '11:20', duration: '1시간 15분', base: 76000 },
  { from: 'KIX', to: 'PUS', airline: '에어부산', airlineCode: 'BX', flightNo: '181', depart: '15:40', arrive: '16:55', duration: '1시간 15분', base: 76000 },
  { from: 'ICN', to: 'TPE', airline: '대한항공', airlineCode: 'KE', flightNo: '693', depart: '08:25', arrive: '10:10', duration: '2시간 45분', base: 176000 },
  { from: 'TPE', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '694', depart: '14:20', arrive: '18:00', duration: '2시간 40분', base: 176000 },
  { from: 'ICN', to: 'BKK', airline: '대한항공', airlineCode: 'KE', flightNo: '651', depart: '17:50', arrive: '21:30', duration: '5시간 40분', base: 248000 },
  { from: 'BKK', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '652', depart: '23:20', arrive: '06:50', plusDay: 1, duration: '5시간 30분', base: 248000 },
  { from: 'ICN', to: 'SIN', airline: '싱가포르항공', airlineCode: 'SQ', flightNo: '609', depart: '16:05', arrive: '21:40', duration: '6시간 35분', base: 312000 },
  { from: 'SIN', to: 'ICN', airline: '싱가포르항공', airlineCode: 'SQ', flightNo: '608', depart: '01:15', arrive: '08:50', duration: '6시간 35분', base: 312000 },
  { from: 'ICN', to: 'DAD', airline: '제주항공', airlineCode: '7C', flightNo: '2903', depart: '07:20', arrive: '10:15', duration: '4시간 55분', base: 142000 },
  { from: 'DAD', to: 'ICN', airline: '제주항공', airlineCode: '7C', flightNo: '2904', depart: '11:20', arrive: '17:10', duration: '4시간 50분', base: 142000 },
  { from: 'GMP', to: 'CJU', airline: '대한항공', airlineCode: 'KE', flightNo: '1211', depart: '07:00', arrive: '08:10', duration: '1시간 10분', base: 68000 },
  { from: 'CJU', to: 'GMP', airline: '대한항공', airlineCode: 'KE', flightNo: '1218', depart: '19:40', arrive: '20:50', duration: '1시간 10분', base: 68000 },
  { from: 'PUS', to: 'CJU', airline: '진에어', airlineCode: 'LJ', flightNo: '511', depart: '09:30', arrive: '10:25', duration: '55분', base: 52000 },
  { from: 'CJU', to: 'PUS', airline: '진에어', airlineCode: 'LJ', flightNo: '512', depart: '16:10', arrive: '17:05', duration: '55분', base: 52000 },
  { from: 'ICN', to: 'HKG', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '721', depart: '09:40', arrive: '12:35', duration: '3시간 55분', base: 198000 },
  { from: 'HKG', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '722', depart: '14:20', arrive: '18:50', duration: '3시간 30분', base: 198000 },
  { from: 'ICN', to: 'PEK', airline: '대한항공', airlineCode: 'KE', flightNo: '861', depart: '09:10', arrive: '10:25', duration: '2시간 15분', base: 186000 },
  { from: 'ICN', to: 'PEK', airline: '중국국제항공', airlineCode: 'CA', flightNo: '126', depart: '13:40', arrive: '14:55', duration: '2시간 15분', base: 164000 },
  { from: 'PEK', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '862', depart: '15:20', arrive: '18:30', duration: '2시간 10분', base: 186000 },
  { from: 'PEK', to: 'ICN', airline: '중국국제항공', airlineCode: 'CA', flightNo: '125', depart: '08:30', arrive: '11:40', duration: '2시간 10분', base: 164000 },
  { from: 'ICN', to: 'PKX', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '331', depart: '08:05', arrive: '09:20', duration: '2시간 15분', base: 172000 },
  { from: 'PKX', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '332', depart: '16:50', arrive: '20:00', duration: '2시간 10분', base: 172000 },
  { from: 'ICN', to: 'PVG', airline: '대한항공', airlineCode: 'KE', flightNo: '893', depart: '08:40', arrive: '09:50', duration: '2시간 10분', base: 198000 },
  { from: 'ICN', to: 'PVG', airline: '중국동방항공', airlineCode: 'MU', flightNo: '5042', depart: '12:15', arrive: '13:25', duration: '2시간 10분', base: 168000 },
  { from: 'PVG', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '894', depart: '14:00', arrive: '17:05', duration: '2시간 5분', base: 198000 },
  { from: 'PVG', to: 'ICN', airline: '중국동방항공', airlineCode: 'MU', flightNo: '5041', depart: '19:10', arrive: '22:15', duration: '2시간 5분', base: 168000 },
  { from: 'GMP', to: 'SHA', airline: '대한항공', airlineCode: 'KE', flightNo: '2117', depart: '09:00', arrive: '10:00', duration: '2시간', base: 188000 },
  { from: 'SHA', to: 'GMP', airline: '대한항공', airlineCode: 'KE', flightNo: '2118', depart: '17:30', arrive: '20:30', duration: '2시간', base: 188000 },
  { from: 'ICN', to: 'CAN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '361', depart: '10:20', arrive: '13:10', duration: '3시간 50분', base: 214000 },
  { from: 'CAN', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '362', depart: '15:00', arrive: '19:40', duration: '3시간 40분', base: 214000 },
  { from: 'ICN', to: 'SZX', airline: '제주항공', airlineCode: '7C', flightNo: '8801', depart: '08:30', arrive: '11:20', duration: '3시간 50분', base: 156000 },
  { from: 'SZX', to: 'ICN', airline: '제주항공', airlineCode: '7C', flightNo: '8802', depart: '12:40', arrive: '17:20', duration: '3시간 40분', base: 156000 },
  { from: 'ICN', to: 'TAO', airline: '대한항공', airlineCode: 'KE', flightNo: '847', depart: '10:05', arrive: '10:55', duration: '1시간 50분', base: 142000 },
  { from: 'TAO', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '848', depart: '18:10', arrive: '20:50', duration: '1시간 40분', base: 142000 },
  { from: 'ICN', to: 'CTU', airline: '중국국제항공', airlineCode: 'CA', flightNo: '440', depart: '12:50', arrive: '16:20', duration: '4시간 30분', base: 228000 },
  { from: 'CTU', to: 'ICN', airline: '중국국제항공', airlineCode: 'CA', flightNo: '439', depart: '08:15', arrive: '13:35', duration: '4시간 20분', base: 228000 },
  { from: 'ICN', to: 'XIY', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '317', depart: '11:30', arrive: '14:10', duration: '3시간 40분', base: 198000 },
  { from: 'XIY', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '318', depart: '15:40', arrive: '19:10', duration: '3시간 30분', base: 198000 },
  { from: 'ICN', to: 'PEK', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '335', depart: '08:20', arrive: '09:35', duration: '2시간 15분', base: 178000 },
  { from: 'PEK', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '336', depart: '16:10', arrive: '19:20', duration: '2시간 10분', base: 178000 },
  { from: 'ICN', to: 'PEK', airline: '중국남방항공', airlineCode: 'CZ', flightNo: '318', depart: '11:05', arrive: '12:20', duration: '2시간 15분', base: 158000 },
  { from: 'PEK', to: 'ICN', airline: '중국남방항공', airlineCode: 'CZ', flightNo: '317', depart: '07:50', arrive: '11:00', duration: '2시간 10분', base: 158000 },
  { from: 'ICN', to: 'PKX', airline: '대한항공', airlineCode: 'KE', flightNo: '859', depart: '10:30', arrive: '11:45', duration: '2시간 15분', base: 184000 },
  { from: 'PKX', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '860', depart: '17:10', arrive: '20:20', duration: '2시간 10분', base: 184000 },
  { from: 'ICN', to: 'PKX', airline: '중국국제항공', airlineCode: 'CA', flightNo: '140', depart: '14:00', arrive: '15:15', duration: '2시간 15분', base: 166000 },
  { from: 'PKX', to: 'ICN', airline: '중국국제항공', airlineCode: 'CA', flightNo: '139', depart: '09:20', arrive: '12:30', duration: '2시간 10분', base: 166000 },
  { from: 'ICN', to: 'PVG', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '351', depart: '09:15', arrive: '10:25', duration: '2시간 10분', base: 188000 },
  { from: 'PVG', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '352', depart: '15:30', arrive: '18:35', duration: '2시간 5분', base: 188000 },
  { from: 'ICN', to: 'PVG', airline: '중국남방항공', airlineCode: 'CZ', flightNo: '326', depart: '13:50', arrive: '15:00', duration: '2시간 10분', base: 162000 },
  { from: 'PVG', to: 'ICN', airline: '중국남방항공', airlineCode: 'CZ', flightNo: '325', depart: '18:40', arrive: '21:45', duration: '2시간 5분', base: 162000 },
  { from: 'ICN', to: 'SHA', airline: '대한항공', airlineCode: 'KE', flightNo: '897', depart: '07:50', arrive: '08:50', duration: '2시간', base: 192000 },
  { from: 'SHA', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '898', depart: '16:40', arrive: '19:40', duration: '2시간', base: 192000 },
  { from: 'ICN', to: 'SHA', airline: '중국동방항공', airlineCode: 'MU', flightNo: '5046', depart: '11:20', arrive: '12:20', duration: '2시간', base: 170000 },
  { from: 'SHA', to: 'ICN', airline: '중국동방항공', airlineCode: 'MU', flightNo: '5045', depart: '14:50', arrive: '17:50', duration: '2시간', base: 170000 },
  { from: 'GMP', to: 'SHA', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '1091', depart: '11:00', arrive: '12:00', duration: '2시간', base: 182000 },
  { from: 'SHA', to: 'GMP', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '1092', depart: '19:00', arrive: '22:00', duration: '2시간', base: 182000 },
  { from: 'GMP', to: 'SHA', airline: '중국동방항공', airlineCode: 'MU', flightNo: '5052', depart: '08:30', arrive: '09:30', duration: '2시간', base: 174000 },
  { from: 'SHA', to: 'GMP', airline: '중국동방항공', airlineCode: 'MU', flightNo: '5051', depart: '16:00', arrive: '19:00', duration: '2시간', base: 174000 },
  { from: 'ICN', to: 'CAN', airline: '대한항공', airlineCode: 'KE', flightNo: '581', depart: '08:50', arrive: '11:40', duration: '3시간 50분', base: 220000 },
  { from: 'CAN', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '582', depart: '13:20', arrive: '18:00', duration: '3시간 40분', base: 220000 },
  { from: 'ICN', to: 'CAN', airline: '중국남방항공', airlineCode: 'CZ', flightNo: '338', depart: '12:10', arrive: '15:00', duration: '3시간 50분', base: 198000 },
  { from: 'CAN', to: 'ICN', airline: '중국남방항공', airlineCode: 'CZ', flightNo: '337', depart: '16:40', arrive: '21:20', duration: '3시간 40분', base: 198000 },
  { from: 'ICN', to: 'SZX', airline: '대한항공', airlineCode: 'KE', flightNo: '177', depart: '09:40', arrive: '12:30', duration: '3시간 50분', base: 208000 },
  { from: 'SZX', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '178', depart: '14:10', arrive: '18:50', duration: '3시간 40분', base: 208000 },
  { from: 'ICN', to: 'SZX', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '325', depart: '11:10', arrive: '14:00', duration: '3시간 50분', base: 196000 },
  { from: 'SZX', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '326', depart: '15:50', arrive: '20:30', duration: '3시간 40분', base: 196000 },
  { from: 'ICN', to: 'SZX', airline: '선전항공', airlineCode: 'ZH', flightNo: '9872', depart: '13:20', arrive: '16:10', duration: '3시간 50분', base: 168000 },
  { from: 'SZX', to: 'ICN', airline: '선전항공', airlineCode: 'ZH', flightNo: '9871', depart: '08:00', arrive: '12:40', duration: '3시간 40분', base: 168000 },
  { from: 'ICN', to: 'TAO', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '307', depart: '07:50', arrive: '08:40', duration: '1시간 50분', base: 138000 },
  { from: 'TAO', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '308', depart: '16:20', arrive: '19:00', duration: '1시간 40분', base: 138000 },
  { from: 'ICN', to: 'TAO', airline: '산동항공', airlineCode: 'SC', flightNo: '4616', depart: '12:40', arrive: '13:30', duration: '1시간 50분', base: 128000 },
  { from: 'TAO', to: 'ICN', airline: '산동항공', airlineCode: 'SC', flightNo: '4615', depart: '14:00', arrive: '16:40', duration: '1시간 40분', base: 128000 },
  { from: 'ICN', to: 'CTU', airline: '대한항공', airlineCode: 'KE', flightNo: '643', depart: '08:10', arrive: '11:40', duration: '4시간 30분', base: 238000 },
  { from: 'CTU', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '644', depart: '13:00', arrive: '18:20', duration: '4시간 20분', base: 238000 },
  { from: 'ICN', to: 'CTU', airline: '사천항공', airlineCode: '3U', flightNo: '3928', depart: '15:20', arrive: '18:50', duration: '4시간 30분', base: 214000 },
  { from: 'CTU', to: 'ICN', airline: '사천항공', airlineCode: '3U', flightNo: '3927', depart: '09:40', arrive: '15:00', duration: '4시간 20분', base: 214000 },
  { from: 'ICN', to: 'XIY', airline: '대한항공', airlineCode: 'KE', flightNo: '623', depart: '08:00', arrive: '10:40', duration: '3시간 40분', base: 206000 },
  { from: 'XIY', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '624', depart: '12:20', arrive: '15:50', duration: '3시간 30분', base: 206000 },
  { from: 'ICN', to: 'XIY', airline: '중국동방항공', airlineCode: 'MU', flightNo: '2078', depart: '13:10', arrive: '15:50', duration: '3시간 40분', base: 186000 },
  { from: 'XIY', to: 'ICN', airline: '중국동방항공', airlineCode: 'MU', flightNo: '2077', depart: '17:20', arrive: '20:50', duration: '3시간 30분', base: 186000 },
  { from: 'PUS', to: 'PVG', airline: '대한항공', airlineCode: 'KE', flightNo: '767', depart: '09:30', arrive: '10:40', duration: '2시간 10분', base: 176000 },
  { from: 'PVG', to: 'PUS', airline: '대한항공', airlineCode: 'KE', flightNo: '768', depart: '15:10', arrive: '18:15', duration: '2시간 5분', base: 176000 },
  { from: 'PUS', to: 'PVG', airline: '중국동방항공', airlineCode: 'MU', flightNo: '5032', depart: '12:00', arrive: '13:10', duration: '2시간 10분', base: 154000 },
  { from: 'PVG', to: 'PUS', airline: '중국동방항공', airlineCode: 'MU', flightNo: '5031', depart: '18:20', arrive: '21:25', duration: '2시간 5분', base: 154000 },
  { from: 'PUS', to: 'TAO', airline: '제주항공', airlineCode: '7C', flightNo: '2303', depart: '08:15', arrive: '09:05', duration: '1시간 50분', base: 98000 },
  { from: 'TAO', to: 'PUS', airline: '제주항공', airlineCode: '7C', flightNo: '2304', depart: '17:40', arrive: '20:20', duration: '1시간 40분', base: 98000 },
  { from: 'PUS', to: 'TAO', airline: '중국국제항공', airlineCode: 'CA', flightNo: '130', depart: '11:50', arrive: '12:40', duration: '1시간 50분', base: 112000 },
  { from: 'TAO', to: 'PUS', airline: '중국국제항공', airlineCode: 'CA', flightNo: '129', depart: '14:20', arrive: '17:00', duration: '1시간 40분', base: 112000 },
  { from: 'ICN', to: 'LAX', airline: '대한항공', airlineCode: 'KE', flightNo: '17', depart: '15:00', arrive: '10:30', duration: '11시간 30분', base: 890000 },
  { from: 'ICN', to: 'LAX', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '202', depart: '20:30', arrive: '16:00', duration: '11시간 30분', base: 820000 },
  { from: 'LAX', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '18', depart: '12:20', arrive: '18:10', plusDay: 1, duration: '13시간 50분', base: 890000 },
  { from: 'LAX', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '201', depart: '23:50', arrive: '05:40', plusDay: 2, duration: '13시간 50분', base: 820000 },
  { from: 'ICN', to: 'SFO', airline: '대한항공', airlineCode: 'KE', flightNo: '23', depart: '14:40', arrive: '09:20', duration: '10시간 40분', base: 860000 },
  { from: 'SFO', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '24', depart: '11:30', arrive: '16:50', plusDay: 1, duration: '13시간 20분', base: 860000 },
  { from: 'ICN', to: 'SEA', airline: '대한항공', airlineCode: 'KE', flightNo: '41', depart: '16:10', arrive: '10:50', duration: '10시간 40분', base: 780000 },
  { from: 'SEA', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '42', depart: '13:00', arrive: '17:20', plusDay: 1, duration: '12시간 20분', base: 780000 },
  { from: 'ICN', to: 'JFK', airline: '대한항공', airlineCode: 'KE', flightNo: '81', depart: '10:00', arrive: '11:30', duration: '14시간 30분', base: 980000 },
  { from: 'ICN', to: 'JFK', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '222', depart: '19:20', arrive: '21:00', duration: '14시간 40분', base: 910000 },
  { from: 'JFK', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '82', depart: '13:40', arrive: '17:50', plusDay: 1, duration: '15시간 10분', base: 980000 },
  { from: 'JFK', to: 'ICN', airline: '아시아나항공', airlineCode: 'OZ', flightNo: '221', depart: '00:50', arrive: '05:10', plusDay: 1, duration: '15시간 20분', base: 910000 },
  { from: 'ICN', to: 'EWR', airline: '대한항공', airlineCode: 'KE', flightNo: '85', depart: '09:30', arrive: '11:10', duration: '14시간 40분', base: 940000 },
  { from: 'EWR', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '86', depart: '13:20', arrive: '17:40', plusDay: 1, duration: '15시간 20분', base: 940000 },
  { from: 'ICN', to: 'ORD', airline: '대한항공', airlineCode: 'KE', flightNo: '37', depart: '10:20', arrive: '10:00', duration: '13시간 40분', base: 870000 },
  { from: 'ORD', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '38', depart: '12:10', arrive: '16:30', plusDay: 1, duration: '14시간 20분', base: 870000 },
  { from: 'ICN', to: 'DFW', airline: '대한항공', airlineCode: 'KE', flightNo: '31', depart: '15:50', arrive: '14:40', duration: '12시간 50분', base: 850000 },
  { from: 'DFW', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '32', depart: '10:30', arrive: '15:20', plusDay: 1, duration: '14시간 50분', base: 850000 },
  { from: 'ICN', to: 'HNL', airline: '대한항공', airlineCode: 'KE', flightNo: '53', depart: '20:40', arrive: '09:50', duration: '8시간 10분', base: 720000 },
  { from: 'HNL', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '54', depart: '12:30', arrive: '18:20', plusDay: 1, duration: '10시간 50분', base: 720000 },
  { from: 'ICN', to: 'LAS', airline: '대한항공', airlineCode: 'KE', flightNo: '27', depart: '16:00', arrive: '12:10', duration: '11시간 10분', base: 880000 },
  { from: 'LAS', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '28', depart: '14:20', arrive: '19:40', plusDay: 1, duration: '13시간 20분', base: 880000 },
  { from: 'ICN', to: 'YVR', airline: '대한항공', airlineCode: 'KE', flightNo: '71', depart: '16:20', arrive: '11:00', duration: '10시간 40분', base: 760000 },
  { from: 'ICN', to: 'YVR', airline: '에어캐나다', airlineCode: 'AC', flightNo: '64', depart: '17:50', arrive: '12:30', duration: '10시간 40분', base: 710000 },
  { from: 'YVR', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '72', depart: '13:10', arrive: '17:00', plusDay: 1, duration: '11시간 50분', base: 760000 },
  { from: 'YVR', to: 'ICN', airline: '에어캐나다', airlineCode: 'AC', flightNo: '63', depart: '14:40', arrive: '18:30', plusDay: 1, duration: '11시간 50분', base: 710000 },
  { from: 'ICN', to: 'YYZ', airline: '대한항공', airlineCode: 'KE', flightNo: '73', depart: '10:10', arrive: '10:40', duration: '13시간 30분', base: 920000 },
  { from: 'YYZ', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '74', depart: '13:00', arrive: '16:40', plusDay: 1, duration: '14시간 40분', base: 920000 },
  { from: 'ICN', to: 'YUL', airline: '대한항공', airlineCode: 'KE', flightNo: '77', depart: '10:40', arrive: '11:50', duration: '14시간 10분', base: 940000 },
  { from: 'YUL', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '78', depart: '13:50', arrive: '17:20', plusDay: 1, duration: '14시간 30분', base: 940000 },
  { from: 'ICN', to: 'YYC', airline: '대한항공', airlineCode: 'KE', flightNo: '79', depart: '15:30', arrive: '11:10', duration: '10시간 40분', base: 800000 },
  { from: 'YYC', to: 'ICN', airline: '대한항공', airlineCode: 'KE', flightNo: '80', depart: '13:20', arrive: '17:10', plusDay: 1, duration: '11시간 50분', base: 800000 },
]

type HotelTemplate = {
  name: string
  city: string
  area: string
  stars: number
  nightly: number
  rating: number
  amenities: string[]
}

const HOTELS: HotelTemplate[] = [
  { name: '난바 오리엔탈 호텔', city: '오사카', area: '난바', stars: 4, nightly: 160000, rating: 8.7, amenities: ['역세권', '조식 선택', '24시 프론트'] },
  { name: '스위소텔 난카이 오사카', city: '오사카', area: '난바역 직결', stars: 5, nightly: 285000, rating: 9.1, amenities: ['역 직결', '수영장', '클럽 라운지'] },
  { name: '호텔 그레이서리 신사이바시', city: '오사카', area: '신사이바시', stars: 4, nightly: 178000, rating: 8.5, amenities: ['쇼핑 중심', '온센', '세탁'] },
  { name: '칸데오 호텔 오사카 남바', city: '오사카', area: '남바', stars: 3, nightly: 128000, rating: 8.3, amenities: ['옥상 온천', '컴팩트'] },
  { name: '모튼즈 고죠 호텔', city: '교토', area: '고조', stars: 3, nightly: 142000, rating: 8.6, amenities: ['마치야 감성', '카페'] },
  { name: '호텔 그랜비아 교토', city: '교토', area: '교토역', stars: 5, nightly: 268000, rating: 8.9, amenities: ['역 직결', '스파'] },
  { name: '세이잔소 가가츠엔', city: '교토', area: '히가시야마', stars: 4, nightly: 310000, rating: 9.2, amenities: ['료칸', '가이세키'] },
  { name: '세라 신주쿠', city: '도쿄', area: '신주쿠', stars: 3, nightly: 155000, rating: 8.2, amenities: ['24시', '캡슐 아님'] },
  { name: '게이오 플라자 호텔 도쿄', city: '도쿄', area: '니시신주쿠', stars: 5, nightly: 320000, rating: 8.8, amenities: ['전망', '이그제큐티브'] },
  { name: '미츠이 가든 긴자 프리미어', city: '도쿄', area: '긴자', stars: 4, nightly: 248000, rating: 8.7, amenities: ['긴자', '온천'] },
  { name: '더 블로스 후쿠오카', city: '후쿠오카', area: '텐진', stars: 4, nightly: 138000, rating: 8.6, amenities: ['텐진', '루프탑'] },
  { name: '호텔 니코 후쿠오카', city: '후쿠오카', area: '하카타', stars: 4, nightly: 164000, rating: 8.4, amenities: ['하카타역', '조식'] },
  { name: '시그니엘 서울', city: '서울', area: '잠실', stars: 5, nightly: 420000, rating: 9.0, amenities: ['한강 뷰', '클럽'] },
  { name: '나인트리 프리미어 명동', city: '서울', area: '명동', stars: 4, nightly: 168000, rating: 8.5, amenities: ['명동', '루프탑'] },
  { name: '파라다이스 호텔 부산', city: '부산', area: '해운대', stars: 5, nightly: 290000, rating: 8.8, amenities: ['오션뷰', '카지노'] },
  { name: '롯데 호텔 제주', city: '제주', area: '중문', stars: 5, nightly: 310000, rating: 8.6, amenities: ['리조트', '키즈'] },
  { name: '그랜드 하얏트 타이베이', city: '타이베이', area: '송산', stars: 5, nightly: 230000, rating: 8.7, amenities: ['쇼핑몰 연결'] },
  { name: '만다린 오리엔탈 방콕', city: '방콕', area: '차오프라야', stars: 5, nightly: 380000, rating: 9.3, amenities: ['강변', '스파'] },
  { name: '마리나베이 샌즈', city: '싱가포르', area: '마리나', stars: 5, nightly: 520000, rating: 9.1, amenities: ['인피니티 풀'] },
  { name: '빈펄 리조트 다낭', city: '다낭', area: '논느억', stars: 5, nightly: 210000, rating: 8.8, amenities: ['비치', '셔틀'] },
  { name: '더 페닌슐라 베이징', city: '베이징', area: '왕푸징', stars: 5, nightly: 380000, rating: 9.0, amenities: ['중심가', '스파'] },
  { name: '오포짓 하우스 싼리툰', city: '베이징', area: '싼리툰', stars: 4, nightly: 210000, rating: 8.4, amenities: ['나이트라이프'] },
  { name: '더 페닌슐라 상하이', city: '상하이', area: '외탄', stars: 5, nightly: 420000, rating: 9.2, amenities: ['외탄', '강뷰'] },
  { name: '진장 메트로폴로 상하이', city: '상하이', area: '인민광장', stars: 4, nightly: 198000, rating: 8.3, amenities: ['지하철'] },
  { name: '화이트 스완 광저우', city: '광저우', area: '사면', stars: 5, nightly: 240000, rating: 8.6, amenities: ['강변'] },
  { name: '더 베벌리 힐스 호텔', city: '로스앤젤레스', area: '베벌리힐스', stars: 5, nightly: 620000, rating: 9.0, amenities: ['풀', '할리우드'] },
  { name: '프리포트 인 산타모니카', city: '로스앤젤레스', area: '산타모니카', stars: 3, nightly: 280000, rating: 8.1, amenities: ['해변'] },
  { name: '더 플라자 뉴욕', city: '뉴욕', area: '센트럴파크', stars: 5, nightly: 780000, rating: 9.1, amenities: ['5번가'] },
  { name: '포 포인츠 타임스스퀘어', city: '뉴욕', area: '타임스스퀘어', stars: 4, nightly: 340000, rating: 8.2, amenities: ['브로드웨이'] },
  { name: '페어몬트 샌프란시스코', city: '샌프란시스코', area: '노브힐', stars: 5, nightly: 480000, rating: 8.8, amenities: ['전망'] },
  { name: '페어몬트 퍼시픽 림', city: '밴쿠버', area: '콜 하버', stars: 5, nightly: 410000, rating: 9.0, amenities: ['하버뷰'] },
  { name: '페어몬트 로열 요크', city: '토론토', area: '다운타운', stars: 5, nightly: 360000, rating: 8.7, amenities: ['유니언역'] },
]

function seed(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function vary(base: number, key: string, min = 0.82, max = 1.38): number {
  const n = seed(key) / 0xffffffff
  const factor = min + n * (max - min)
  const weekendBump = /[06]$/.test(key.slice(-1)) ? 1.12 : 1
  return Math.round((base * factor * weekendBump) / 1000) * 1000
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type FlightQuery = {
  from: string
  to: string
  date: string
}

export type HotelQuery = {
  city: string
  checkIn: string
  nights: number
}

export async function searchFlights(query: FlightQuery): Promise<FlightOffer[]> {
  await wait(420 + (seed(query.date + query.from + query.to) % 280))
  const rows = FLIGHTS.filter((f) => f.from === query.from && f.to === query.to)
  return rows.map((f, i) => {
    const price = vary(f.base, `${query.date}:${f.airlineCode}${f.flightNo}`)
    return {
      id: `${f.airlineCode}${f.flightNo}-${query.date}-${i}`,
      airline: f.airline,
      airlineCode: f.airlineCode,
      flightNo: f.flightNo,
      from: f.from,
      to: f.to,
      fromCity: cityOf(f.from),
      toCity: cityOf(f.to),
      date: query.date,
      depart: f.depart,
      arrive: f.arrive,
      plusDay: f.plusDay ?? 0,
      duration: f.duration,
      stops: 0,
      cabin: '이코노미',
      price,
      seats: 3 + (seed(query.date + f.flightNo) % 9),
    }
  }).sort((a, b) => a.depart.localeCompare(b.depart) || a.airline.localeCompare(b.airline, 'ko'))
}

export async function searchHotels(query: HotelQuery): Promise<HotelOffer[]> {
  await wait(380 + (seed(query.city + query.checkIn) % 240))
  const city = query.city.trim()
  const rows = HOTELS.filter((h) => !city || h.city.includes(city) || city.includes(h.city))
  return rows.map((h, i) => ({
    id: `${h.city}-${i}-${query.checkIn}`,
    name: h.name,
    city: h.city,
    area: h.area,
    stars: h.stars,
    nightly: vary(h.nightly, `${h.name}:${query.checkIn}:${query.nights}`, 0.88, 1.22),
    rating: h.rating,
    amenities: h.amenities,
  })).sort((a, b) => a.nightly - b.nightly)
}

export function hotelCities(): string[] {
  return [...new Set(HOTELS.map((h) => h.city))]
}

export function groupedAirports() {
  const groups = new Map<string, typeof AIRPORTS>()
  for (const a of AIRPORTS) {
    const list = groups.get(a.country) ?? []
    list.push(a)
    groups.set(a.country, list)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'ko'))
    .map(([country, list]) => [
      country,
      [...list].sort(
        (x, y) => x.city.localeCompare(y.city, 'ko') || x.name.localeCompare(y.name, 'ko'),
      ),
    ] as const)
}
