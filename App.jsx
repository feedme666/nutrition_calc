import React, { useState } from "react";
import { createRoot } from 'react-dom/client';
import { format } from "date-fns";
import { motion } from "framer-motion";
import './index.css';

export function optimizeNutrition({ usedBW, formulaInfo, hoursPerDay }) {
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
      const error = Math.abs(totalEnergy - targetEnergy) +
        Math.abs(totalProtein - targetProtein);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-700 text-white py-10 px-4">
      <motion.div
        className="max-w-3xl mx-auto bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-xl p-8 space-y-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300 text-center">
          栄養投与計算機
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-bold">身長 (cm)</span>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="mt-1 w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </label>
            <label className="block">
              <span className="text-lg font-bold">体重 (kg)</span>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="mt-1 w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </label>
            <label className="block">
              <span className="text-lg font-bold">開始日</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </label>
            <label className="block">
              <span className="text-lg font-bold">投与時間</span>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="24h">24時間</option>
                <option value="15h">15時間</option>
              </select>
            </label>
            <label className="block">
              <span className="text-lg font-bold">目標達成までの日数</span>
              <select
                value={daysToTarget}
                onChange={(e) => setDaysToTarget(Number(e.target.value))}
                className="mt-1 w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value={4}>4日間</option>
                <option value={7}>7日間</option>
              </select>
            </label>
            <label className="block">
              <span className="text-lg font-bold">経腸栄養剤の種類</span>
              <select
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {Object.keys(formulaData).map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </label>

            <button
              onClick={calculate}
              className="mt-4 mx-auto block px-8 py-3 font-bold text-lg rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            >
              計算
            </button>
          </div>

          {results && (
            <motion.div
              className="col-span-1 md:col-span-2 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="space-y-1">
                <div className="text-xl font-semibold">入力内容:</div>
                <div>身長: {results.height} cm</div>
                <div>体重: {results.weight} kg</div>
                <div>開始日: {results.startDate}</div>
                <div>投与時間: {results.duration === '24h' ? '24時間' : '15時間'}</div>
                <div>目標達成までの日数: {results.daysToTarget} 日</div>
                <div>経腸栄養剤の種類: {results.formula}</div>
              </div>
              <hr className="border-gray-400" />

              <div className="space-y-1">
                <div><strong>BMI:</strong> {results.bmi}</div>
                <div>栄養投与体重：{results.usedBW} kg（{results.weightTypeLabel}）</div>
                <div>目標ｴﾈﾙｷﾞｰ量：25〜30 kcal/kg/day → {results.minEnergy}〜{results.maxEnergy} kcal/day</div>
                <div>目標ﾀﾝﾊﾟｸ量：1.2〜1.5 g/kg/day → {results.minProtein}〜{results.maxProtein} g/day</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.schedule.map((s, i) => (
                  <motion.div
                    key={i}
                    className="border border-gray-300 rounded-xl bg-white bg-opacity-20 p-4 shadow backdrop-blur hover:bg-opacity-30 transition"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="text-lg font-bold mb-2">{s.date}</div>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{formula}</span>
                      <span>{s.rate} ml/h × {results.duration}</span>
                    </div>
                    <div className="mt-1">ミルクプロテイン: {s.supp} 包</div>
                    <div className="mt-2 text-sm">E: {s.totalEnergy} kcal</div>
                    <div className="text-sm">P: {s.totalProtein} g</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
