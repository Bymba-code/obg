import React, { useState } from "react";
import { flushSync } from "react-dom";
import {
  Award, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Send, Trophy, AlertCircle
} from "lucide-react";
import css from "./style.module.css";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const ExamMake = ({ tests, contentId, axiosInstance, getUrl, onTestResult, onComplete }) => {
  const [selected,  setSelected]  = useState({});
  const [loading,   setLoading]   = useState(false);
  const [expanded,  setExpanded]  = useState(() =>
    (tests || []).reduce((acc, t) => ({ ...acc, [t.id]: true }), {})
  );

  if (!tests || tests.length === 0) return null;

  /* ── derived ── */
  const unansweredTests = tests.filter(t => !t.answered);
  const answeredTests   = tests.filter(t =>  t.answered);
  const allAnswered     = unansweredTests.length === 0;
  const selectedCount   = unansweredTests.filter(t => selected[t.id]).length;
  const allSelected     = unansweredTests.length > 0 && unansweredTests.every(t => selected[t.id]);
  const correctCount    = answeredTests.filter(t => t.is_correct).length;
  const progressPct     = unansweredTests.length > 0
    ? Math.round((selectedCount / unansweredTests.length) * 100)
    : 100;

  const handleSelect = (testId, answerId) => {
    if (tests.find(t => t.id === testId)?.answered) return;
    setSelected(p => ({ ...p, [testId]: answerId }));
  };

  const toggleExpand = (testId) =>
    setExpanded(p => ({ ...p, [testId]: !p[testId] }));

  /* ══════════════════════════════════════════════════════════════
     handleSubmitAll
     ✅ Tест + Progress-г ПАРАЛЛЕЛЬ илгээнэ (хоёуланг хүлээхгүй)
     ✅ flushSync: results + onComplete нэг render дотор шинэчилнэ
  ══════════════════════════════════════════════════════════════ */
  const handleSubmitAll = async () => {
    if (!allSelected || loading) return;
    setLoading(true);

    try {
      const answers = unansweredTests.map(t => ({
        content_test_id: t.id,
        answer_id:       selected[t.id],
      }));

      /* ── Тест + Progress хоёуланг зэрэг илгээ ── */
      const [testRes] = await Promise.all([
        axiosInstance.post("/user-content-test-answers", { content_id: contentId, answers }),
        axiosInstance
          .post("/user-content-progress", { content: contentId, progress: 100 })
          .catch(err => console.warn("[progress]", err)),
      ]);

      if (!testRes || testRes.status !== 200) return;

      const { results = [] } = testRes.data.data;

      /* ── flushSync: бүх state нэг render дотор шинэчилнэ ── */
      flushSync(() => {
        results.forEach(r => {
          onTestResult(
            r.test_id,
            {
              is_correct:         r.is_correct,
              score:              r.score,
              correct_answer_ids: r.correct_answer_ids,
            },
            r.user_answer_id
          );
        });
        if (onComplete) onComplete(contentId);
      });

    } catch (err) {
      console.error("[ExamMake submit]", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css.quizSection}>

      {/* ── Header ── */}
      <div className={css.quizSectionHeader}>
        <div className={css.quizSectionIcon}><Award size={22} /></div>
        <div style={{ flex: 1 }}>
          <h3 className={css.quizSectionTitle}>Тест</h3>
          <p className={css.quizSectionSub}>
            {allAnswered
              ? `${correctCount}/${tests.length} зөв хариуллаа`
              : `${tests.length} асуултад хариулаад нэг дор илгээнэ үү`}
          </p>
        </div>
        {allAnswered && (
          <div className={css.scoreChip}>
            <span className={css.scoreNumber}>{Math.round((correctCount / tests.length) * 100)}%</span>
            <span className={css.scoreLabel}>Оноо</span>
          </div>
        )}
      </div>

      {/* ── Test cards ── */}
      <div className={css.testList}>
        {tests.map((test, index) => {
          const isExpanded     = expanded[test.id];
          const selectedAnswer = selected[test.id];
          const isAnswered     = test.answered;

          return (
            <div
              key={test.id}
              className={[css.testCard, isAnswered ? css.testCardSubmitted : ""].filter(Boolean).join(" ")}
              style={isAnswered ? {
                borderColor: test.is_correct ? "var(--gr)" : "var(--re)",
                background:  test.is_correct
                  ? "linear-gradient(160deg,#F0FDF4 0%,#FAFFFE 100%)"
                  : "linear-gradient(160deg,#FEF2F2 0%,#FFFAFA 100%)",
              } : {}}
            >
              {/* Card header */}
              <div
                className={css.questionMeta}
                onClick={() => toggleExpand(test.id)}
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: ".875rem", transition: "all .2s",
                    background: isAnswered
                      ? test.is_correct ? "var(--gr)"  : "var(--re)"
                      : selectedAnswer  ? "var(--or)"  : "var(--g200)",
                    color: (isAnswered || selectedAnswer) ? "white" : "var(--g500)",
                    boxShadow: isAnswered
                      ? test.is_correct
                        ? "0 4px 12px rgba(16,185,129,.4)"
                        : "0 4px 12px rgba(239,68,68,.4)"
                      : selectedAnswer ? "0 4px 12px var(--or-glow)" : "none",
                  }}>
                    {isAnswered
                      ? test.is_correct ? <CheckCircle size={16} /> : <XCircle size={16} />
                      : index + 1}
                  </div>
                  <span style={{
                    fontSize: ".9375rem", fontWeight: 600, color: "var(--g900)",
                    flex: 1, minWidth: 0,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {test.name}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexShrink: 0 }}>
                  {isAnswered ? (
                    <span className={test.is_correct ? css.resultPillCorrect : css.resultPillWrong}
                      style={{ display: "inline-flex", alignItems: "center", gap: ".3rem" }}>
                      {test.is_correct
                        ? <><CheckCircle size={12} />Зөв</>
                        : <><XCircle size={12} />Буруу</>}
                    </span>
                  ) : selectedAnswer ? (
                    <span className={css.questionNumber} style={{ color: "var(--or)" }}>
                      <CheckCircle size={12} /> Сонгосон
                    </span>
                  ) : (
                    <span className={css.questionNumber}
                      style={{ color: "var(--g400)", background: "var(--g100)", borderColor: "transparent" }}>
                      <AlertCircle size={12} /> Хариулаагүй
                    </span>
                  )}
                  <span style={{ color: "var(--g400)", display: "flex", alignItems: "center" }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </div>
              </div>

              {/* Expanded body */}
              {isExpanded && (
                <>
                  {test.img && (
                    <div className={css.questionImgWrap}>
                      <img src={getUrl(test.img)} alt={test.name} className={css.questionImg} />
                    </div>
                  )}

                  <div className={css.answerGrid}>
                    {(test.answers || []).map((answer, ai) => {
                      const isSelected   = String(selectedAnswer) === String(answer.id);
                      const isUserAnswer = isAnswered &&
                        (test.user_answers || []).some(ua => String(ua) === String(answer.id));

                      let btnClass = css.answerBtn;
                      if (isAnswered) {
                        if (answer.is_correct === true)  btnClass += " " + css.answerCorrect;
                        else if (isUserAnswer)           btnClass += " " + css.answerWrong;
                      } else if (isSelected) {
                        btnClass += " " + css.answerSelected;
                      }

                      return (
                        <button
                          key={answer.id}
                          className={btnClass}
                          onClick={() => handleSelect(test.id, answer.id)}
                          disabled={isAnswered}
                        >
                          <span className={css.answerLetter}>{LETTERS[ai] || ai + 1}</span>
                          <span className={css.answerText}>{answer.title}</span>
                          <span className={css.answerIndicator}>
                            {isAnswered
                              ? answer.is_correct === true
                                ? <CheckCircle size={16} />
                                : isUserAnswer ? <XCircle size={16} /> : null
                              : isSelected ? <CheckCircle size={16} /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className={[
                      css.resultBanner,
                      test.is_correct ? css.resultBannerCorrect : css.resultBannerWrong
                    ].join(" ")}>
                      <div className={css.resultBannerLeft}>
                        {test.is_correct
                          ? <Trophy size={26} className={css.resultTrophy} />
                          : <XCircle size={26} style={{ color: "var(--re)", flexShrink: 0 }} />}
                        <div>
                          <p className={css.resultBannerTitle}>
                            {test.is_correct ? "Маш сайн! Зөв хариуллаа" : "Буруу хариуллаа"}
                          </p>
                          <p className={css.resultBannerSub}>
                            {test.is_correct
                              ? "Үргэлжлүүлэн ахиц гаргаж байна"
                              : "Зөв хариулт ногоонаар тэмдэглэгдлээ"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Sticky submit panel ── */}
      {!allAnswered && (
        <div style={{
          marginTop: "1.5rem",
          background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)",
          borderRadius: 20, padding: "1.5rem 1.75rem",
          border: "1.5px solid rgba(225,118,27,.25)",
          position: "sticky", bottom: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,.3)",
        }}>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".5rem" }}>
              <span style={{ fontSize: ".75rem", fontWeight: 700, color: "rgba(225,118,27,.85)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                Явц
              </span>
              <span style={{ fontSize: ".8125rem", fontWeight: 700, color: "rgba(255,255,255,.9)" }}>
                {selectedCount} / {unansweredTests.length} асуулт
              </span>
            </div>
            <div style={{ width: "100%", height: 7, background: "rgba(255,255,255,.1)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: "linear-gradient(90deg,var(--or) 0%,#FFD700 100%)",
                width: `${progressPct}%`,
                transition: "width .35s cubic-bezier(.4,0,.2,1)",
                boxShadow: "0 0 10px rgba(225,118,27,.55)",
              }} />
            </div>
          </div>

          <button
            className={allSelected ? css.submitBtnActive : css.submitBtn}
            onClick={handleSubmitAll}
            disabled={!allSelected || loading}
            style={{ fontSize: "1rem" }}
          >
            {loading ? (
              <><span className={css.submitSpinner} />Илгээж байна...</>
            ) : (
              <><Send size={18} />{allSelected
                ? "Бүх хариулт илгээх"
                : `${unansweredTests.length - selectedCount} асуулт үлдлээ`}</>
            )}
          </button>
        </div>
      )}

      {/* ── Final summary ── */}
      {allAnswered && answeredTests.length > 0 && (
        <div style={{
          marginTop: "1.5rem", padding: "1.5rem", borderRadius: 16,
          background: correctCount === tests.length
            ? "linear-gradient(135deg,rgba(16,185,129,.1) 0%,rgba(5,150,105,.05) 100%)"
            : "linear-gradient(135deg,rgba(225,118,27,.08) 0%,rgba(42,2,160,.04) 100%)",
          border: `1.5px solid ${correctCount === tests.length ? "rgba(16,185,129,.3)" : "rgba(225,118,27,.2)"}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "1rem", flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              background: correctCount === tests.length ? "var(--gr)" : "var(--or)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: correctCount === tests.length
                ? "0 4px 16px rgba(16,185,129,.45)"
                : "0 4px 16px var(--or-glow)",
            }}>
              <Trophy size={24} color="white" />
            </div>
            <div>
              <p style={{ margin: "0 0 .2rem", fontSize: ".9375rem", fontWeight: 700, color: "var(--g900)" }}>
                {correctCount === tests.length ? "Бүгдийг зөв хариуллаа!" : "Тест дуусгалаа"}
              </p>
              <p style={{ margin: 0, fontSize: ".8125rem", color: "var(--g500)", fontWeight: 500 }}>
                {correctCount} зөв · {tests.length - correctCount} буруу · нийт {tests.length}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: ".75rem" }}>
            {[
              { val: correctCount,                                    label: "Зөв",  color: "var(--gr)" },
              { val: `${Math.round((correctCount/tests.length)*100)}%`, label: "Оноо", color: "var(--or)" },
            ].map(s => (
              <div key={s.label} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                background: "white", borderRadius: 12,
                padding: ".625rem 1.125rem",
                boxShadow: "0 2px 8px rgba(0,0,0,.08)", minWidth: 62,
              }}>
                <span style={{ fontSize: "1.375rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</span>
                <span style={{ fontSize: ".6875rem", fontWeight: 600, color: "var(--g400)", textTransform: "uppercase", letterSpacing: ".05em", marginTop: 3 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamMake;