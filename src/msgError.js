const msgError = code => {
  switch (code) {
    case '50403':
      return 'ไม่พบสินค้าในช่องสินค้า';
    case '50205':
      return 'มีสินค้าอยู่ในลิฟท์';
    default:
      return 'เกิดข้อผิดพลาดกับอุปกรณ์';
  }
};

export default {
  msgError,
};
