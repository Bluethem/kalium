package com.laboQuimica.kalium.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FrontendContextService {
    private static final Logger logger = LoggerFactory.getLogger(FrontendContextService.class);

    @Value("${FRONTEND_SRC_PATH:../frontend/frontend-kalium/src}")
    private String frontendSrcPath;

    @Value("${FRONTEND_CONTEXT_MAX_CHARS:3000}")
    private int maxCharsDefault;

    // Simple in-memory index: path -> brief summary
    private final Map<String, String> fileSummaries = new HashMap<>();

    private static final List<String> INCLUDED_EXT = Arrays.asList(
            ".tsx", ".ts", ".jsx", ".js", ".json", ".css"
    );

    @PostConstruct
    public void init() {
        try {
            Path base = Paths.get(frontendSrcPath).toAbsolutePath().normalize();
            if (!Files.exists(base)) {
                logger.warn("Frontend src path not found: {}", base);
                return;
            }
            logger.info("Indexing frontend sources from: {}", base);
            Files.walk(base)
                    .filter(p -> Files.isRegularFile(p) && shouldInclude(p))
                    .forEach(this::indexFileSafe);
            logger.info("Indexed {} frontend files for context", fileSummaries.size());
        } catch (IOException e) {
            logger.error("Error indexing frontend sources", e);
        }
    }

    private boolean shouldInclude(Path p) {
        String name = p.getFileName().toString().toLowerCase(Locale.ROOT);
        for (String ext : INCLUDED_EXT) {
            if (name.endsWith(ext)) return true;
        }
        return false;
    }

    private void indexFileSafe(Path p) {
        try {
            String rel = p.toString();
            String content = readHead(p, 2000); // read first ~2000 chars
            String summary = summarizeFile(rel, content);
            fileSummaries.put(rel, summary);
        } catch (Exception ex) {
            logger.debug("Skip file in index due to error: {} - {}", p, ex.getMessage());
        }
    }

    private String readHead(Path p, int maxChars) throws IOException {
        byte[] bytes = Files.readAllBytes(p);
        String s = new String(bytes, StandardCharsets.UTF_8);
        if (s.length() > maxChars) {
            return s.substring(0, maxChars);
        }
        return s;
    }

    private String summarizeFile(String path, String content) {
        // Naive summary: capture first component/function/class name and any obvious route/label/title tokens
        String firstLine = Arrays.stream(content.split("\n")).findFirst().orElse("");
        String name = extractName(content);
        String hints = extractHints(content);
        return String.format(Locale.ROOT, "path=%s\nname=%s\nfirstLine=%s\nhints=%s", path, name, firstLine, hints);
    }

    private String extractName(String content) {
        // Try common React patterns
        String[] markers = new String[]{
                "export default function ",
                "export function ",
                "function ",
                "class ",
                "const ",
        };
        for (String m : markers) {
            int i = content.indexOf(m);
            if (i >= 0) {
                int start = i + m.length();
                int end = start;
                while (end < content.length()) {
                    char c = content.charAt(end);
                    if (!Character.isJavaIdentifierPart(c)) break;
                    end++;
                }
                if (end > start) return content.substring(start, end).trim();
            }
        }
        return "(unknown)";
    }

    private String extractHints(String content) {
        List<String> hints = new ArrayList<>();
        // Capture title-like strings
        if (content.contains("document.title")) hints.add("document.title");
        if (content.contains("<Route")) hints.add("Route");
        if (content.contains("pathname")) hints.add("pathname");
        if (content.contains("/api/")) hints.add("apiCalls");
        if (content.toLowerCase(Locale.ROOT).contains("navbar")) hints.add("navbar");
        if (content.toLowerCase(Locale.ROOT).contains("footer")) hints.add("footer");
        return String.join(",", hints);
    }

    public String getContextFor(String urlPath, String userPrompt, int budgetChars) {
        if (fileSummaries.isEmpty()) return "";
        int budget = budgetChars > 0 ? budgetChars : maxCharsDefault;

        // Score files by simple heuristics: path/name match and keyword overlap
        Map<String, Double> scored = new HashMap<>();
        Set<String> terms = tokenize(userPrompt + " " + (urlPath == null ? "" : urlPath));
        for (Map.Entry<String, String> e : fileSummaries.entrySet()) {
            String path = e.getKey();
            String summary = e.getValue();
            double score = scorePath(path, terms) + scoreSummary(summary, terms);
            if (score > 0) scored.put(path, score);
        }

        List<Map.Entry<String, Double>> top = scored.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(40)
                .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        sb.append("[FRONTEND INDEX]\n");
        int used = sb.length();
        for (Map.Entry<String, Double> it : top) {
            String summary = fileSummaries.get(it.getKey());
            String block = String.format(Locale.ROOT, "- score=%.2f file=%s\n%s\n\n", it.getValue(), it.getKey(), summary);
            if (used + block.length() > budget) break;
            sb.append(block);
            used += block.length();
        }
        return sb.toString();
    }

    private Set<String> tokenize(String s) {
        return Arrays.stream(Optional.ofNullable(s).orElse("")
                        .toLowerCase(Locale.ROOT)
                        .replaceAll("[^a-z0-9_/.-]", " ")
                        .split("\\s+") )
                .filter(t -> t.length() > 2)
                .collect(Collectors.toSet());
    }

    private double scorePath(String path, Set<String> terms) {
        String p = path.toLowerCase(Locale.ROOT);
        double score = 0;
        for (String t : terms) {
            if (p.contains(t)) score += 1.0;
        }
        return score;
    }

    private double scoreSummary(String summary, Set<String> terms) {
        String s = summary.toLowerCase(Locale.ROOT);
        double score = 0;
        for (String t : terms) {
            if (s.contains(t)) score += 0.5;
        }
        return score;
    }
}
