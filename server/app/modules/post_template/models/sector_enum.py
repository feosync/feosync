from enum import Enum


class sector_enum(str, Enum):
    technology = "technology"
    finance = "finance"
    healthcare = "healthcare"
    education = "education"
    retail = "retail"
    manufacturing = "manufacturing"