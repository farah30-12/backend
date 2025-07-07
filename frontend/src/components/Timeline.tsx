"use client";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

import { FaBriefcase, FaCalendar } from "react-icons/fa";

export default function Timeline() {
  return (
    <VerticalTimeline>
      <VerticalTimelineElement
        className="vertical-timeline-element--work"
        contentStyle={{ background: "#f0f4ff", color: "#000" }}
        contentArrowStyle={{ borderRight: "7px solid #f0f4ff" }}
        date="2010"
        iconStyle={{ background: "#FFD700", color: "#fff" }}
        icon={<FaBriefcase />}
      >
        <h3 className="vertical-timeline-element-title">Lorem Ipsum</h3>
        <h4 className="vertical-timeline-element-subtitle">Subtitle</h4>
        <p>Some content for 2010 goes here...</p>
      </VerticalTimelineElement>

      <VerticalTimelineElement
        className="vertical-timeline-element--work"
        date="2011"
        iconStyle={{ background: "#FF8C00", color: "#fff" }}
        icon={<FaCalendar />}
      >
        <h3 className="vertical-timeline-element-title">Dolor Sit Amet</h3>
        <p>Description of 2011 event.</p>
      </VerticalTimelineElement>

      {/* ➕ Add more events as needed... */}
    </VerticalTimeline>
  );
}
