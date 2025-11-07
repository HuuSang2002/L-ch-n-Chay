
      // 🌿 Danh sách ngày ăn chay (Thập trai)
      let ngayChay = [1, 8, 14, 15, 18, 23, 24, 28, 29, 30];

      // 🌕 Hàm chuyển đổi Dương → Âm (chuẩn theo thuật toán lịch âm)
      function convertSolar2Lunar(dd, mm, yy) {
        mm = mm + 1;
        const PI = Math.PI;
        function INT(d) { return Math.floor(d); }

        function jdFromDate(dd, mm, yy) {
          const a = INT((14 - mm) / 12);
          const y = yy + 4800 - a;
          const m = mm + 12 * a - 3;
          let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4)
            - INT(y / 100) + INT(y / 400) - 32045;
          if (jd < 2299161)
            jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
          return jd;
        }

        function getNewMoonDay(k, timeZone) {
          const T = k / 1236.85;
          const T2 = T * T;
          const T3 = T2 * T;
          const dr = PI / 180;
          let Jd1 = 2415020.75933 + 29.53058868 * k
            + 0.0001178 * T2 - 0.000000155 * T3;
          Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
          const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
          const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
          const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
          let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr)
            + 0.0021 * Math.sin(2 * dr * M)
            - 0.4068 * Math.sin(Mpr * dr)
            + 0.0161 * Math.sin(2 * dr * Mpr)
            - 0.0004 * Math.sin(3 * dr * Mpr)
            + 0.0104 * Math.sin(2 * dr * F)
            - 0.0051 * Math.sin((M + Mpr) * dr)
            - 0.0074 * Math.sin((M - Mpr) * dr)
            + 0.0004 * Math.sin((2 * F + M) * dr)
            - 0.0004 * Math.sin((2 * F - M) * dr)
            - 0.0006 * Math.sin((2 * F + Mpr) * dr)
            + 0.0010 * Math.sin((2 * F - Mpr) * dr)
            + 0.0005 * Math.sin((2 * Mpr + M) * dr);
          let deltaT;
          if (T < -11) deltaT = 0.001 + 0.000839 * T + 0.0002261 * T2
            - 0.00000845 * T3 - 0.000000081 * T * T3;
          else deltaT = -0.000278 + 0.000265 * T + 0.000262 * T2;
          const JdNew = Jd1 + C1 - deltaT;
          return INT(JdNew + 0.5 + timeZone / 24);
        }

        function getSunLongitude(jdn, timeZone) {
          const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
          const T2 = T * T;
          const dr = PI / 180;
          const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
          const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
          let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
          DL = DL + (0.019993 - 0.000101 * T) * Math.sin(2 * dr * M)
            + 0.000290 * Math.sin(3 * dr * M);
          let L = L0 + DL;
          L = L * dr;
          L = L - 2 * Math.PI * (INT(L / (2 * Math.PI)));
          return INT(L / Math.PI * 6);
        }

        function getLunarMonth11(yy, timeZone) {
          const off = jdFromDate(31, 12, yy) - 2415021.076998695;
          const k = INT(off / 29.530588853);
          let nm = getNewMoonDay(k, timeZone);
          const sunLong = getSunLongitude(nm, timeZone);
          if (sunLong >= 9) nm = getNewMoonDay(k - 1, timeZone);
          return nm;
        }

        function getLeapMonthOffset(a11, timeZone) {
          const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
          let last = getSunLongitude(getNewMoonDay(k + 1, timeZone), timeZone);
          let i = 1;
          let arc = getSunLongitude(getNewMoonDay(k + i + 1, timeZone), timeZone);
          while (arc !== last && i < 14) {
            last = arc;
            i++;
            arc = getSunLongitude(getNewMoonDay(k + i + 1, timeZone), timeZone);
          }
          return i - 1;
        }

        function getLunarDate(dd, mm, yy, timeZone) {
          const dayNumber = jdFromDate(dd, mm, yy);
          const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
          let monthStart = getNewMoonDay(k + 1, timeZone);
          if (monthStart > dayNumber) monthStart = getNewMoonDay(k, timeZone);
          let a11 = getLunarMonth11(yy, timeZone);
          let b11 = a11;
          if (a11 >= monthStart) a11 = getLunarMonth11(yy - 1, timeZone);
          else b11 = getLunarMonth11(yy + 1, timeZone);
          const diff = INT((monthStart - a11) / 29);
          let lunarMonth = diff + 11;
          if (b11 - a11 > 365) {
            const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
            if (diff >= leapMonthDiff) lunarMonth = diff + 10;
          }
          if (lunarMonth > 12) lunarMonth -= 12;
          const lunarYear = (lunarMonth >= 11 && diff < 4) ? yy - 1 : yy;
          const lunarDay = dayNumber - monthStart + 1;
          return { lunarDay, lunarMonth, lunarYear };
        }

        return getLunarDate(dd, mm, yy, 7);
      }

      // 🧭 Lấy ngày hiện tại
      const today = new Date();
      const lunar = convertSolar2Lunar(today.getDate(), today.getMonth(), today.getFullYear());
      const ngayAm = lunar.lunarDay;
      const thangAm = lunar.lunarMonth;
      const namAm = lunar.lunarYear;

      // 🌙 Tính chính xác số ngày trong tháng âm (để biết đủ hay thiếu)
      const monthStartSolar = new Date(today);
      monthStartSolar.setDate(today.getDate() - (ngayAm - 1));
      const msPerDay = 24 * 60 * 60 * 1000;
      let probe = new Date(monthStartSolar);
      probe.setDate(probe.getDate() + 1);
      let probeLunar = convertSolar2Lunar(probe.getDate(), probe.getMonth(), probe.getFullYear());
      while (!(probeLunar.lunarDay === 1 && probeLunar.lunarMonth !== thangAm)) {
        probe.setDate(probe.getDate() + 1);
        probeLunar = convertSolar2Lunar(probe.getDate(), probe.getMonth(), probe.getFullYear());
      }
      const lunarMonthDaysAccurate = Math.round((probe - monthStartSolar) / msPerDay);
      const loaiThang = lunarMonthDaysAccurate === 30 ? "Tháng đủ (30 ngày)" : "Tháng thiếu (29 ngày)";

      // Cập nhật thông tin
      document.getElementById("lunar-date").textContent = `${ngayAm}/${thangAm}`;
      document.getElementById("month-type").textContent = loaiThang;
      document.getElementById("solar-date").textContent = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

      // Nếu tháng thiếu → thay 30 bằng 27
      if (lunarMonthDaysAccurate === 29) {
        ngayChay = ngayChay.map(n => n === 30 ? 27 : n);
      }

      // 🧘‍♂️ Hiển thị kết quả hôm nay
      const resultEl = document.getElementById("result");
      const resultText = document.getElementById("result-text");
      const resultIcon = document.getElementById("result-icon");

      if (ngayChay.includes(ngayAm)) {
        resultText.textContent = `Hôm nay (Âm lịch ${ngayAm}/${thangAm}) là NGÀY ĂN CHAY`;
        resultIcon.innerHTML = '<i class="fas fa-leaf"></i>';
        resultEl.classList.add("chay");
      } else {
        resultText.textContent = `Hôm nay (Âm lịch ${ngayAm}/${thangAm}) là NGÀY ĂN MẶN`;
        resultIcon.innerHTML = '<i class="fas fa-utensils"></i>';
        resultEl.classList.add("man");
      }

      // Tạo lịch
      // function createCalendar() {
      //   const calendarEl = document.getElementById("calendar");
      //   calendarEl.innerHTML = '';

      //   // Tạo các ngày trong tháng
      //   for (let i = 1; i <= lunarMonthDaysAccurate; i++) {
      //     const dayEl = document.createElement("div");
      //     dayEl.className = "calendar-day";
      //     dayEl.textContent = i;

      //     // Kiểm tra nếu là ngày chay
      //     if (ngayChay.includes(i)) {
      //       dayEl.classList.add("chay-day");
      //     }

      //     // Kiểm tra nếu là hôm nay
      //     if (i === ngayAm) {
      //       dayEl.classList.add("today");
      //     }

      //     calendarEl.appendChild(dayEl);
      //   }
      // }

      // Tạo lịch
      function createCalendar() {
        const calendarEl = document.getElementById("calendar");
        calendarEl.innerHTML = '';

        // Tìm ngày đầu tháng âm
        const firstDayOfMonth = new Date(monthStartSolar);

        // Tìm thứ của ngày đầu tháng (0 = Chủ Nhật, 1 = Thứ 2, ...)
        let firstWeekday = firstDayOfMonth.getDay();

        // Thêm các ô trống cho những ngày trước ngày đầu tháng
        for (let i = 0; i < firstWeekday; i++) {
          const emptyDay = document.createElement("div");
          emptyDay.className = "calendar-day empty";
          calendarEl.appendChild(emptyDay);
        }

        // Tạo các ngày trong tháng
        for (let i = 1; i <= lunarMonthDaysAccurate; i++) {
          const dayEl = document.createElement("div");
          dayEl.className = "calendar-day";
          dayEl.textContent = i;

          // Kiểm tra nếu là ngày chay
          if (ngayChay.includes(i)) {
            dayEl.classList.add("chay-day");
          }

          // Kiểm tra nếu là hôm nay
          if (i === ngayAm) {
            dayEl.classList.add("today");
          }

          calendarEl.appendChild(dayEl);
        }
      }

      // Gọi hàm tạo lịch
      createCalendar();
