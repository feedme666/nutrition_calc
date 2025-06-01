import React, { useState } from "react";
import { createRoot } from 'react-dom/client';
import { format } from "date-fns";
import './index.css';

function App() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(60);
  const [startDate, setStartDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [duration, setDuration] = useState("24h");
  const [daysToTarget, setDaysToTarget] = useState(4);
  const [formula, setFormula] = useState("ﾃﾙﾐｰﾙ2.0α");
  const [results, setResults] = useState(null);

  const formulaData = {
    "ｱｲｿｶﾙBag2K": { kcal: 2.0, protein: 0.072 },
    "ﾃﾙﾐｰﾙ2.0α": { kcal: 2.0, protein: 0.072 },
    "ﾍﾟﾌﾟﾀﾒﾝｽﾀﾝﾀﾞｰﾄﾞ": { kcal: 1.5, protein: 0.053 },
    "ﾍﾟﾌﾟﾀﾒﾝAF": { kcal: 1.5, protein: 0.095 },
    "ｱｲｿｶﾙｻﾎﾟｰﾄ1.0": { kcal: 1.0, protein: 0.045 }
  };

  function optimizeNutrition({ usedBW, formulaInfo, hoursPerDay }) {
    const targetEnergy = usedBW * 27;
    const targetProtein = usedBW * 1.3;
    let best = null;
    let minError = Infinity;

    for (let rate = 5; rate <= 200; rate++) {
      const volume = rate * hoursPerDay;
      const energyFromFormula = volume * formulaInfo.kcal;
      const proteinFromFormula = volume * formulaInfo.protein;

      for (let supp = 0; supp <= 6; supp++) {
        const totalEnergy = energyFromFormula + supp * 50;
        const totalProtein = proteinFromFormula + supp * 10;
        const error = Math.abs(totalEnergy - targetEnergy) + Math.abs(totalProtein - targetProtein);
        if (error < minError) {
          minError = error;
          best = {
            rate,
            supp,
            totalEnergy: Math.round(totalEnergy),
            totalProtein: Math.round(totalProtein)
          };
        }
      }
    }
    return best;
  }

  function calculate() {
    const heightM = height / 100;
    const bmi = Math.round(weight / (heightM * heightM));
    const IBW = 22 * heightM * heightM;
    const isObese = bmi >= 30;
    const pBW = IBW + (weight - IBW) * 0.33;
    const usedBW = isObese ? pBW : weight;
    const hoursPerDay = duration === "24h" ? 24 : 15;
    const formulaInfo = formulaData[formula];
    const minEnergy = Math.round(usedBW * 25);
    const maxEnergy = Math.round(usedBW * 30);
    const minProtein = Math.round(usedBW * 1.2);
    const maxProtein = Math.round(usedBW * 1.5);
    const best = optimizeNutrition({ usedBW, formulaInfo, hoursPerDay });

    const schedule = [];
    for (let day = 0; day < daysToTarget; day++) {
      const dateObj = new Date(new Date(startDate).getTime() + day * 86400000);
      const date = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
      const rate = Math.round((best.rate / daysToTarget) * (day + 1));
      const volume = rate * hoursPerDay;
      const energyFromFormula = Math.round(volume * formulaInfo.kcal);
      const proteinFromFormula = Math.round(volume * formulaInfo.protein);
      const totalEnergy = energyFromFormula + best.supp * 50;
      const totalProtein = proteinFromFormula + best.supp * 10;

      schedule.push({ date, rate, supp: best.supp, totalEnergy, totalProtein });
    }

    setResults({
      height,
      weight,
      startDate,
      duration,
      daysToTarget,
      formula,
      bmi,
      isObese,
      usedBW: Math.round(usedBW),
      weightTypeLabel: isObese ? "調整体重" : "実体重",
      minEnergy,
      maxEnergy,
      minProtein,
      maxProtein,
      schedule
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">栄養投与計算機</h1>

      <div className="grid grid-cols-1 gap-4">
        <label>身長 (cm)
          <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} /></label>
        <label>体重 (kg)
          <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} /></label>
        <label>開始日
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
        <label>投与時間
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="24h">24時間</option>
            <option value="15h">15時間</option>
          </select></label>
        <label>目標達成までの日数
          <select value={daysToTarget} onChange={(e) => setDaysToTarget(Number(e.target.value))}>
            <option value={4}>4日間</option>
            <option value={7}>7日間</option>
          </select></label>
        <label>経腸栄養剤の種類
          <select value={formula} onChange={(e) => setFormula(e.target.value)}>
            {Object.keys(formulaData).map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select></label>
        <button onClick={calculate}>計算</button>
      </div>

      {results && (
        <div className="mt-6 space-y-2">
          <div><strong>入力内容:</strong></div>
          <div>身長: {results.height} cm</div>
          <div>体重: {results.weight} kg</div>
          <div>開始日: {results.startDate}</div>
          <div>投与時間: {results.duration === '24h' ? '24時間' : '15時間'}</div>
          <div>目標達成までの日数: {results.daysToTarget} 日</div>
          <div>経腸栄養剤の種類: {results.formula}</div>
          <hr className="my-2" />

          <div><strong>BMI:</strong> {results.bmi}</div>
          <div>栄養投与体重：{results.usedBW} kg（{results.weightTypeLabel}）</div>
          <div>目標ｴﾈﾙｷﾞｰ量：25〜30 kcal/kg/day → {results.minEnergy}〜{results.maxEnergy} kcal/day</div>
          <div>目標ﾀﾝﾊﾟｸ量：1.2〜1.5 g/kg/day → {results.minProtein}〜{results.maxProtein} g/day</div>
          <div className="mt-4 space-y-2">
            {results.schedule.map((s, i) => (
              <div key={i} className="border p-3 rounded bg-gray-50">
                {s.date} {formula} {s.rate}ml/h×{duration}、ﾐﾙｸﾌﾟﾛﾃｲﾝ{s.supp}包（E:{s.totalEnergy}kcal, P:{s.totalProtein}g）
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
