const articleInput = document.getElementById("article");
const summarizeBtn = document.getElementById("summarizeBtn");
const resultBox = document.getElementById("result");
const loading = document.getElementById("loading");

summarizeBtn.addEventListener("click", async () => {
  const content = articleInput.value.trim();

  if (!content) {
    alert("请先输入需要总结的文章内容！");
    return;
  }

  // 显示加载状态
  summarizeBtn.disabled = true;
  loading.classList.remove("hidden");
  resultBox.innerHTML = '<p class="placeholder">总结结果将显示在这里...</p>';

  try {
    const response = await fetch("/.netlify/functions/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "请求失败，请稍后重试");
    }

    // 显示结果
    resultBox.textContent = data.summary;
  } catch (error) {
    console.error(error);
    resultBox.innerHTML = `<p style="color: #ef4444;">错误：${error.message}</p>`;
  } finally {
    summarizeBtn.disabled = false;
    loading.classList.add("hidden");
  }
});
